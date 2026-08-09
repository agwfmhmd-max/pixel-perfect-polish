-- =====================================================================
--  Full admin control — run this whole file once in Supabase → SQL Editor
--  Order: schema.sql → new_features.sql → seed.sql → THIS FILE
--  Idempotent: safe to re-run. Nothing is dropped or destroyed.
--
--  What it does:
--   1. Education: adds academic level + exact dates (editable from dashboard)
--   2. Stats: new editable table for the 4 numbers shown in the About section
--   3. Imports every piece of default site content into the database so the
--      admin can edit ALL of it (projects, education, experience, skills,
--      social links, profile, site settings, stats).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Education: academic level + precise dates
-- ---------------------------------------------------------------------
alter table public.education
  add column if not exists level      text,
  add column if not exists level_fr   text,
  add column if not exists level_ar   text,
  add column if not exists start_date date,
  add column if not exists end_date   date;

-- ---------------------------------------------------------------------
-- 2. Editable statistics (About section strip)
-- ---------------------------------------------------------------------
create table if not exists public.stats (
  id         uuid primary key default gen_random_uuid(),
  value      text not null,
  label      text not null,
  label_fr   text,
  label_ar   text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.stats to anon, authenticated;
grant insert, update, delete on public.stats to authenticated;
grant all on public.stats to service_role;

alter table public.stats enable row level security;

drop policy if exists "public read stats" on public.stats;
create policy "public read stats" on public.stats
  for select to anon, authenticated using (true);

drop policy if exists "admin write stats" on public.stats;
create policy "admin write stats" on public.stats
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

insert into public.stats (value, label, label_fr, label_ar, sort_order)
select v.value, v.label, v.label_fr, v.label_ar, v.sort_order from (values
  ('5+', 'Projects',          'Projets',              'مشاريع',      1),
  ('1',  'Internship',        'Stage',                'تدريب',       2),
  ('1',  'Academic Journey',  'Parcours académique',  'مسار أكاديمي', 3),
  ('∞',  'Digital Solutions', 'Solutions numériques', 'حلول رقمية',   4)
) as v(value,label,label_fr,label_ar,sort_order)
where not exists (select 1 from public.stats);

-- ---------------------------------------------------------------------
-- 3. Import default site content so everything becomes editable
-- ---------------------------------------------------------------------

-- Profile ------------------------------------------------------------
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

-- Site settings ------------------------------------------------------
insert into public.site_settings (site_title, site_description)
select 'Mohamed Dah Agove', 'Banque & Assurance Student · Software Developer'
where not exists (select 1 from public.site_settings);

-- Education (with academic level) ------------------------------------
insert into public.education (institution, degree, field, level, description, start_year, current, location, sort_order)
select
  'Institut Supérieur de Comptabilité et d''Administration des Entreprises (ISCAE)',
  'Licence / Bachelor', 'Banque et Assurance', 'Third Year', 'Third Year Student.',
  2023, true, 'Mauritania', 1
where not exists (select 1 from public.education);

-- Fill the level for an existing row that has none
update public.education
set level = 'Third Year'
where level is null and start_year = 2023;

-- Experience ---------------------------------------------------------
insert into public.experience (organization, position, department, description, start_date, current, location, sort_order)
select
  'Banque Centrale de Mauritanie',
  'Intern',
  'Direction Générale de la Supervision Bancaire et de la Stabilité Financière',
  'Internship within the Directorate in charge of banking supervision and financial stability, directly connected to the Banque et Assurance curriculum: banking regulation, supervision of financial institutions and financial stability.',
  date '2026-01-01', false, 'Nouakchott, Mauritania', 1
where not exists (select 1 from public.experience);

-- Skills -------------------------------------------------------------
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

-- Projects (the ones already visible on the site) ---------------------
insert into public.projects (title, slug, short_description, full_description, category, live_url, technologies, featured, sort_order)
values
  ('Teyssir ERP','teyssir-erp','Enterprise Resource Planning Platform.','An ERP platform designed to help organisations manage their operations and information in a structured, modern and digital way.','Management','https://teyssir-erp.vercel.app', array['React','TypeScript','Supabase'], true, 1),
  ('UNEM ISCAE','unem-iscae','Plateforme de l''Union Nationale des Étudiants de Mauritanie – ISCAE.','A digital platform for the National Union of Mauritanian Students at ISCAE, making information, services and communication with students easier to access.','Education','https://unem-iscae.vercel.app/', array['Next.js','Supabase'], false, 2),
  ('Revision BA & FC','revision-ba-fc','Plateforme de révision pour les étudiants BA & FC.','A revision platform for BA and FC students, providing a digital environment that helps students organise and review their courses.','Student Projects','https://revision-ba-fc.vercel.app/', array['React','Supabase'], false, 3),
  ('ResultatRIM','resultatrim','National Competition Results Platform.','A digital platform presenting the results of national competitions in Mauritania in a clear and organised way.','Education','https://resultatrim.vercel.app', array['React','PostgreSQL'], false, 4),
  ('ISCAE Promo 18','iscae-promo-18','Plateforme de gestion de la cérémonie de graduation.','A digital platform to manage and present information about the graduation of the 18th promotion of ISCAE.','Student Projects','https://iscae-promo-18.vercel.app/', array['Next.js','Supabase'], false, 5)
on conflict (slug) do nothing;

-- Social links -------------------------------------------------------
insert into public.social_links (platform, url, icon, enabled, sort_order)
select v.platform, v.url, v.icon, true, v.sort_order from (values
  ('GitHub','[YOUR GITHUB]','github',1),
  ('LinkedIn','[YOUR LINKEDIN]','linkedin',2),
  ('Email','mailto:[YOUR EMAIL]','mail',3)
) as v(platform,url,icon,sort_order)
where not exists (select 1 from public.social_links);

-- =====================================================================
-- Reminder: the admin account needs the admin role once:
--   insert into public.user_roles (user_id, role)
--   select id, 'admin' from auth.users where email = 'YOUR@EMAIL.COM'
--   on conflict do nothing;
-- =====================================================================
