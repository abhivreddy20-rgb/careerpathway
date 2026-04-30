-- CareerPathway schema
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query) once.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  current_grade text,
  desired_profession text,
  completed_items jsonb not null default '[]'::jsonb,
  custom_items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create table if not exists public.pathways (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  current_grade text not null,
  desired_profession text not null,
  track text not null,
  plans jsonb not null,
  source text not null check (source in ('openai','fallback')),
  created_at timestamptz not null default now(),
  unique (user_id, current_grade, desired_profession)
);

alter table public.pathways enable row level security;

drop policy if exists "pathways_select_own" on public.pathways;
create policy "pathways_select_own"
  on public.pathways for select
  using (auth.uid() = user_id);

drop policy if exists "pathways_insert_own" on public.pathways;
create policy "pathways_insert_own"
  on public.pathways for insert
  with check (auth.uid() = user_id);

drop policy if exists "pathways_update_own" on public.pathways;
create policy "pathways_update_own"
  on public.pathways for update
  using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', null))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- External-API caches. Shared across users (the data is the same for everyone)
-- and written only by the service role from the edge functions. Authenticated
-- users get read access so the SPA can render directly from cache.
-- ============================================================================

-- College Scorecard cache.
create table if not exists public.colleges (
  unitid bigint primary key,
  name text not null,
  city text,
  state text,
  admission_rate numeric,
  sat_avg integer,
  cost_attendance numeric,
  size integer,
  url text,
  raw jsonb not null,
  fetched_at timestamptz not null default now()
);

create index if not exists colleges_state_idx on public.colleges (state);
create index if not exists colleges_name_idx on public.colleges (lower(name));

alter table public.colleges enable row level security;

drop policy if exists "colleges_read_all" on public.colleges;
create policy "colleges_read_all"
  on public.colleges for select
  to authenticated
  using (true);

-- O*NET occupation cache.
create table if not exists public.occupations (
  onet_code text primary key,
  title text not null,
  description text,
  median_wage numeric,
  education text,
  outlook text,
  skills jsonb not null default '[]'::jsonb,
  related_titles text[] not null default array[]::text[],
  raw jsonb not null,
  fetched_at timestamptz not null default now()
);

create index if not exists occupations_title_idx on public.occupations (lower(title));

alter table public.occupations enable row level security;

drop policy if exists "occupations_read_all" on public.occupations;
create policy "occupations_read_all"
  on public.occupations for select
  to authenticated
  using (true);

-- Maps a free-text profession the user typed → normalized O*NET codes + track.
-- The edge function fills this the first time it resolves a phrase, then later
-- requests for the same phrase short-circuit to the cache.
create table if not exists public.profession_lookup (
  profession_key text primary key,
  onet_codes text[] not null,
  track text not null,
  fetched_at timestamptz not null default now()
);

alter table public.profession_lookup enable row level security;

drop policy if exists "profession_lookup_read_all" on public.profession_lookup;
create policy "profession_lookup_read_all"
  on public.profession_lookup for select
  to authenticated
  using (true);

-- Generic key/value cache for anything we don't want to model as its own table.
create table if not exists public.api_cache (
  provider text not null,
  cache_key text not null,
  payload jsonb not null,
  fetched_at timestamptz not null default now(),
  primary key (provider, cache_key)
);

alter table public.api_cache enable row level security;

drop policy if exists "api_cache_read_all" on public.api_cache;
create policy "api_cache_read_all"
  on public.api_cache for select
  to authenticated
  using (true);

-- ============================================================================
-- Per-user saved items (colleges, occupations, courses bookmarked from results).
-- ============================================================================
create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null check (item_type in ('college','occupation','course','custom')),
  item_ref text not null,
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, item_type, item_ref)
);

create index if not exists saved_items_user_idx on public.saved_items (user_id);

alter table public.saved_items enable row level security;

drop policy if exists "saved_items_select_own" on public.saved_items;
create policy "saved_items_select_own"
  on public.saved_items for select
  using (auth.uid() = user_id);

drop policy if exists "saved_items_insert_own" on public.saved_items;
create policy "saved_items_insert_own"
  on public.saved_items for insert
  with check (auth.uid() = user_id);

drop policy if exists "saved_items_delete_own" on public.saved_items;
create policy "saved_items_delete_own"
  on public.saved_items for delete
  using (auth.uid() = user_id);
