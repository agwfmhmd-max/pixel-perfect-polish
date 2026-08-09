-- =====================================================================
-- New editable project fields: Problem / Solution / Features
-- Run this in the Supabase SQL editor.
-- Safe to run multiple times.
-- =====================================================================

alter table public.projects add column if not exists problem     text;
alter table public.projects add column if not exists problem_fr  text;
alter table public.projects add column if not exists problem_ar  text;

alter table public.projects add column if not exists solution    text;
alter table public.projects add column if not exists solution_fr text;
alter table public.projects add column if not exists solution_ar text;

-- One feature per line
alter table public.projects add column if not exists features    text;
alter table public.projects add column if not exists features_fr text;
alter table public.projects add column if not exists features_ar text;

-- Data API access (unchanged policies, only re-asserted grants)
grant select on public.projects to anon;
grant select, insert, update, delete on public.projects to authenticated;
grant all on public.projects to service_role;
