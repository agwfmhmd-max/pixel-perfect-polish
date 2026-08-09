-- =====================================================================
--  Multilingual content + Supabase media library
--  Run this whole file once in the Supabase SQL editor.
--  It is idempotent (safe to re-run).
--  Nothing existing is dropped or modified — only additions.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Translated columns (French + Arabic) for every editable text field.
--    The original column keeps the English / default value.
-- ---------------------------------------------------------------------
alter table public.profile
  add column if not exists full_name_fr text,
  add column if not exists full_name_ar text,
  add column if not exists headline_fr  text,
  add column if not exists headline_ar  text,
  add column if not exists bio_fr       text,
  add column if not exists bio_ar       text,
  add column if not exists location_fr  text,
  add column if not exists location_ar  text;

alter table public.education
  add column if not exists institution_fr text,
  add column if not exists institution_ar text,
  add column if not exists degree_fr      text,
  add column if not exists degree_ar      text,
  add column if not exists field_fr       text,
  add column if not exists field_ar       text,
  add column if not exists description_fr text,
  add column if not exists description_ar text,
  add column if not exists location_fr    text,
  add column if not exists location_ar    text;

alter table public.experience
  add column if not exists organization_fr text,
  add column if not exists organization_ar text,
  add column if not exists position_fr     text,
  add column if not exists position_ar     text,
  add column if not exists department_fr   text,
  add column if not exists department_ar   text,
  add column if not exists description_fr  text,
  add column if not exists description_ar  text,
  add column if not exists location_fr     text,
  add column if not exists location_ar     text;

alter table public.skills
  add column if not exists name_fr     text,
  add column if not exists name_ar     text,
  add column if not exists category_fr text,
  add column if not exists category_ar text;

alter table public.projects
  add column if not exists title_fr             text,
  add column if not exists title_ar             text,
  add column if not exists short_description_fr text,
  add column if not exists short_description_ar text,
  add column if not exists full_description_fr  text,
  add column if not exists full_description_ar  text,
  add column if not exists category_fr          text,
  add column if not exists category_ar          text;

alter table public.social_links
  add column if not exists platform_fr text,
  add column if not exists platform_ar text;

alter table public.site_settings
  add column if not exists site_title_fr       text,
  add column if not exists site_title_ar       text,
  add column if not exists site_description_fr text,
  add column if not exists site_description_ar text;

-- ---------------------------------------------------------------------
-- 2. Interface texts (all UI strings, editable from the dashboard)
-- ---------------------------------------------------------------------
create table if not exists public.ui_translations (
  key        text primary key,
  en         text,
  fr         text,
  ar         text,
  updated_at timestamptz not null default now()
);

grant select on public.ui_translations to anon;
grant select, insert, update, delete on public.ui_translations to authenticated;
grant all on public.ui_translations to service_role;

alter table public.ui_translations enable row level security;

drop policy if exists "ui_translations public read" on public.ui_translations;
create policy "ui_translations public read"
  on public.ui_translations for select
  to anon, authenticated
  using (true);

drop policy if exists "ui_translations admin write" on public.ui_translations;
create policy "ui_translations admin write"
  on public.ui_translations for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------
-- 3. Media library (images stored in Supabase Storage)
-- ---------------------------------------------------------------------
create table if not exists public.media_assets (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  path       text not null unique,
  url        text not null,
  mime_type  text,
  size       bigint,
  alt_en     text,
  alt_fr     text,
  alt_ar     text,
  created_at timestamptz not null default now()
);

grant select on public.media_assets to anon;
grant select, insert, update, delete on public.media_assets to authenticated;
grant all on public.media_assets to service_role;

alter table public.media_assets enable row level security;

drop policy if exists "media_assets public read" on public.media_assets;
create policy "media_assets public read"
  on public.media_assets for select
  to anon, authenticated
  using (true);

drop policy if exists "media_assets admin write" on public.media_assets;
create policy "media_assets admin write"
  on public.media_assets for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------
-- 4. Public storage bucket "media" + its policies
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "media public read" on storage.objects;
create policy "media public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media')
  with check (bucket_id = 'media');

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media');
