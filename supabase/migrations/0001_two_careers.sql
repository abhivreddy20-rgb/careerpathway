-- Two-career support.
-- Run this once in Supabase SQL editor on top of the existing schema.
-- Idempotent: safe to re-run.

-- 1. New columns on profiles.
alter table public.profiles
  add column if not exists secondary_profession text,
  add column if not exists active_profession    text;

-- 2. Migrate completed_items: array -> object keyed by profession.
--    Old shape: ["9:courses:Algebra I", ...]
--    New shape: { "Software Engineer": ["9:courses:Algebra I", ...] }
update public.profiles
set completed_items = jsonb_build_object(
      coalesce(desired_profession, '__unassigned__'),
      completed_items
    )
where jsonb_typeof(completed_items) = 'array';

-- 3. Migrate custom_items the same way.
update public.profiles
set custom_items = jsonb_build_object(
      coalesce(desired_profession, '__unassigned__'),
      custom_items
    )
where jsonb_typeof(custom_items) = 'array';

-- 4. Default active_profession to whatever the user already had.
update public.profiles
set active_profession = desired_profession
where active_profession is null
  and desired_profession is not null;
