-- Mohamed Dah Agove — Unified Supabase setup for the new project
-- Run this entire file once in Supabase Dashboard → SQL Editor.
-- Then create an Auth user and run the admin-role statement at the end.
-- ================================================================

-- ---------------- BASE SCHEMA ----------------
-- =============================================================
-- Mohamed Dah Agove — Portfolio CMS schema
-- Run this in Supabase → SQL Editor (copy / paste / Run)
-- =============================================================

create extension if not exists "pgcrypto";

-- ------------------------- ROLES -----------------------------
do $$ begin
  create type public.app_role as enum ('admin', 'user');
exception when duplicate_object then null; end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

drop policy if exists "read own roles" on public.user_roles;
create policy "read own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  );
$$;

-- ------------------------- TABLES ----------------------------
create table if not exists public.profile (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  headline text,
  bio text,
  profile_image text,
  email text,
  phone text,
  location text,
  github_url text,
  linkedin_url text,
  whatsapp_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.education (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  degree text not null,
  field text,
  description text,
  start_year int,
  end_year int,
  current boolean not null default false,
  location text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.experience (
  id uuid primary key default gen_random_uuid(),
  organization text not null,
  position text not null,
  department text,
  description text,
  start_date date,
  end_date date,
  current boolean not null default false,
  location text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name text not null,
  level int check (level is null or (level between 0 and 100)),
  icon text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text,
  full_description text,
  category text not null default 'Web Development',
  image_url text,
  live_url text,
  github_url text,
  technologies text[] not null default '{}',
  featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  url text not null,
  icon text,
  enabled boolean not null default true,
  sort_order int not null default 0
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_title text not null,
  site_description text,
  primary_color text,
  accent_color text,
  favicon_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 255),
  subject text check (subject is null or char_length(subject) <= 150),
  message text not null check (char_length(message) between 1 and 2000),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists projects_sort_idx on public.projects (sort_order);
create index if not exists skills_sort_idx on public.skills (category, sort_order);
create index if not exists messages_created_idx on public.messages (created_at desc);

-- ------------------------- GRANTS ----------------------------
grant select on public.profile, public.education, public.experience,
  public.skills, public.projects, public.social_links, public.site_settings to anon, authenticated;
grant insert, update, delete on public.profile, public.education, public.experience,
  public.skills, public.projects, public.social_links, public.site_settings to authenticated;

grant insert on public.messages to anon, authenticated;
grant select, update, delete on public.messages to authenticated;

grant all on public.profile, public.education, public.experience, public.skills,
  public.projects, public.social_links, public.site_settings, public.messages to service_role;

-- --------------------------- RLS -----------------------------
alter table public.profile enable row level security;
alter table public.education enable row level security;
alter table public.experience enable row level security;
alter table public.skills enable row level security;
alter table public.projects enable row level security;
alter table public.social_links enable row level security;
alter table public.site_settings enable row level security;
alter table public.messages enable row level security;

do $$
declare t text;
begin
  foreach t in array array['profile','education','experience','skills','projects','social_links','site_settings']
  loop
    execute format('drop policy if exists "public read %1$s" on public.%1$I', t);
    execute format('create policy "public read %1$s" on public.%1$I for select to anon, authenticated using (true)', t);

    execute format('drop policy if exists "admin write %1$s" on public.%1$I', t);
    execute format('create policy "admin write %1$s" on public.%1$I for all to authenticated using (public.has_role(auth.uid(), ''admin'')) with check (public.has_role(auth.uid(), ''admin''))', t);
  end loop;
end $$;

-- messages: anyone can send, only admin can read / update / delete
drop policy if exists "anyone can send a message" on public.messages;
create policy "anyone can send a message" on public.messages
  for insert to anon, authenticated with check (true);

drop policy if exists "admin reads messages" on public.messages;
create policy "admin reads messages" on public.messages
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "admin updates messages" on public.messages;
create policy "admin updates messages" on public.messages
  for update to authenticated using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "admin deletes messages" on public.messages;
create policy "admin deletes messages" on public.messages
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- =============================================================
-- AFTER creating your admin user in Authentication → Users,
-- run this once (replace the email):
--
-- insert into public.user_roles (user_id, role)
-- select id, 'admin' from auth.users where email = 'YOUR@EMAIL.COM'
-- on conflict do nothing;
-- =============================================================

-- ---------------- PROJECT DETAIL TRANSLATIONS ----------------
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

-- ---------------- TRANSLATIONS AND MEDIA ----------------
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
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

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
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

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
  with check (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'))
  with check (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.has_role(auth.uid(), 'admin'));

-- ---------------- INITIAL CONTENT ----------------
-- =============================================================
-- Seed data — Mohamed Dah Agove
-- Run AFTER schema.sql (Supabase → SQL Editor)
-- Replace [YOUR EMAIL] / [YOUR GITHUB] / [YOUR LINKEDIN] as needed.
-- =============================================================

insert into public.profile (full_name, headline, bio, email, location, github_url, linkedin_url, whatsapp_url)
select
  'Mohamed Dah Agove',
  'Banque & Assurance Student · Software Developer',
  'Third-year Banque et Assurance student at ISCAE and Software Developer passionate about building useful digital solutions, web applications and management systems.',
  '[YOUR EMAIL]',
  'Nouakchott, Mauritania',
  '[YOUR GITHUB]',
  '[YOUR LINKEDIN]',
  '[YOUR WHATSAPP]'
where not exists (select 1 from public.profile);

insert into public.education (institution, degree, field, description, start_year, current, location, sort_order)
select
  'Institut Supérieur de Comptabilité et d''Administration des Entreprises (ISCAE)',
  'Licence / Bachelor', 'Banque et Assurance', 'Third Year Student.', 2023, true, 'Mauritania', 1
where not exists (select 1 from public.education);

insert into public.experience (organization, position, department, description, start_date, current, location, sort_order)
select
  'Banque Centrale de Mauritanie',
  'Intern',
  'Direction Générale de la Supervision Bancaire et de la Stabilité Financière',
  'Internship within the Directorate in charge of banking supervision and financial stability, directly connected to the Banque et Assurance curriculum.',
  date '2026-01-01', false, 'Nouakchott, Mauritania', 1
where not exists (select 1 from public.experience);

insert into public.skills (category, name, sort_order)
select v.category, v.name, v.sort_order from (values
  ('Banking & Finance','Banking',1),
  ('Banking & Finance','Insurance',2),
  ('Banking & Finance','Financial Analysis',3),
  ('Banking & Finance','Banking Supervision',4),
  ('Banking & Finance','Financial Stability',5),
  ('Banking & Finance','Accounting',6),
  ('Banking & Finance','Risk Awareness',7),
  ('Development','HTML',8),
  ('Development','CSS',9),
  ('Development','JavaScript',10),
  ('Development','TypeScript',11),
  ('Development','React',12),
  ('Development','Next.js',13),
  ('Development','Node.js',14),
  ('Development','REST APIs',15),
  ('Database & Backend','Supabase',16),
  ('Database & Backend','PostgreSQL',17),
  ('Database & Backend','MySQL',18),
  ('Database & Backend','Authentication',19),
  ('Database & Backend','Database Design',20),
  ('Tools','Git',21),
  ('Tools','GitHub',22),
  ('Tools','Vercel',23),
  ('Tools','Cloudinary',24),
  ('Tools','VS Code',25)
) as v(category,name,sort_order)
where not exists (select 1 from public.skills);

insert into public.projects (title, slug, short_description, full_description, category, live_url, technologies, featured, sort_order)
values
  ('Teyssir ERP','teyssir-erp','Enterprise Resource Planning Platform.','An ERP platform designed to help organisations manage their operations and information in a structured, modern and digital way.','Management','https://teyssir-erp.vercel.app', array['React','TypeScript','Supabase'], true, 1),
  ('UNEM ISCAE','unem-iscae','Plateforme de l''Union Nationale des Étudiants de Mauritanie – ISCAE.','A digital platform for the National Union of Mauritanian Students at ISCAE, making information, services and communication with students easier to access.','Education','https://unem-iscae.vercel.app/', array['Next.js','Supabase'], false, 2),
  ('Revision BA & FC','revision-ba-fc','Plateforme de révision pour les étudiants BA & FC.','A revision platform for BA and FC students, providing a digital environment that helps students organise and review their courses.','Student Projects','https://revision-ba-fc.vercel.app/', array['React','Supabase'], false, 3),
  ('ResultatRIM','resultatrim','National Competition Results Platform.','A digital platform presenting the results of national competitions in Mauritania in a clear and organised way.','Education','https://resultatrim.vercel.app', array['React','PostgreSQL'], false, 4),
  ('ISCAE Promo 18','iscae-promo-18','Plateforme de gestion de la cérémonie de graduation.','A digital platform to manage and present information about the graduation of the 18th promotion of ISCAE.','Student Projects','https://iscae-promo-18.vercel.app/', array['Next.js','Supabase'], false, 5)
on conflict (slug) do nothing;

insert into public.social_links (platform, url, icon, enabled, sort_order)
select v.platform, v.url, v.icon, true, v.sort_order from (values
  ('GitHub','[YOUR GITHUB]','github',1),
  ('LinkedIn','[YOUR LINKEDIN]','linkedin',2),
  ('Email','mailto:[YOUR EMAIL]','mail',3)
) as v(platform,url,icon,sort_order)
where not exists (select 1 from public.social_links);

insert into public.site_settings (site_title, site_description)
select
  'Mohamed Dah Agove | Banque & Assurance Student & Software Developer',
  'Third-year Banque et Assurance student at ISCAE and Software Developer building digital solutions in finance, education and enterprise management.'
where not exists (select 1 from public.site_settings);

-- ---------------- ADMIN USER ----------------
-- 1) Create the user first in Authentication → Users.
-- 2) Replace the email below, uncomment the statement, and run it.
-- insert into public.user_roles (user_id, role)
-- select id, 'admin' from auth.users where email = 'YOUR_ADMIN_EMAIL@example.com'
-- on conflict (user_id, role) do nothing;
