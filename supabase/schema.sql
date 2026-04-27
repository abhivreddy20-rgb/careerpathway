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
