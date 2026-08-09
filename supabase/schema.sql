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
