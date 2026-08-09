# Mohamed Dah Agove — Portfolio + Supabase CMS

Production-ready personal portfolio (EN / FR / AR, light + dark) with a hidden
developer dashboard backed by Supabase Auth, Postgres and Row Level Security.

## 1. Run locally

```bash
bun install      # or: npm install
bun run dev      # http://localhost:8080
bun run build    # production build
```

## 2. Supabase setup (one time)

1. Open your project → **SQL Editor** → paste and run `supabase/schema.sql`.
2. Then paste and run `supabase/seed.sql` (initial content).
3. **Authentication → Users → Add user** → create your admin account (email + password, confirm it).
4. Back in the SQL Editor, grant yourself the admin role:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'YOUR@EMAIL.COM'
on conflict do nothing;
```

Public visitors get `SELECT` only; write access requires an authenticated user with the `admin` role.
Only the publishable key is used in the browser — no service-role key anywhere.

## 3. Hidden developer access

- Click the **MDA** logo in the navbar **5 times within 2.5 seconds** → the *Developer Access* modal opens.
- Keyboard shortcut: **Ctrl + Shift + A**.
- After signing in you land on `/admin` (blocked and `noindex` for everyone else).

Dashboard sections: Dashboard, Profile, Education, Experience, Skills, Projects, Social Links, Messages, Settings, Logout.
Everything you save is written to Supabase and appears immediately on the public site.

## 4. Deploy to Vercel

1. Push the repository to GitHub.
2. Vercel → **New Project** → import the repo (framework auto-detected, build `bun run build`).
3. Add environment variables (see `.env.example`):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - optional: `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`
4. Deploy. In Supabase → **Authentication → URL Configuration**, add your Vercel domain to the redirect URLs (needed for password reset).

## 5. Where to change things

| What | Where |
| --- | --- |
| Name, headline, bio, photo, email, phone, GitHub, LinkedIn, WhatsApp | Dashboard → **Profile** (or `supabase/seed.sql`) |
| Projects (add / edit / delete, featured, order, images, links, tech) | Dashboard → **Projects** |
| Education / Experience / Skills / Social links | Dashboard → matching section |
| Contact messages | Dashboard → **Messages** |
| Fallback content used before the database is seeded | `src/data/fallback.ts` |
| Statistics numbers (5+ projects, …) | `STATS` in `src/data/fallback.ts` |
| Translations EN / FR / AR | `src/lib/i18n.tsx` |
| Colours, fonts, shadows, radius (design system) | `src/styles.css` |
| SEO title / description / JSON-LD | `src/routes/index.tsx` and `src/routes/__root.tsx` |
| Crawling rules / sitemap | `public/robots.txt`, `public/sitemap.xml` |
| Image uploads (Cloudinary) | `src/components/admin/image-field.tsx` + env vars |

## 6. Structure

```
src/
  routes/       index.tsx (portfolio) · admin.tsx (dashboard) · reset-password.tsx
  components/
    site/       navbar hero about education experience skills projects journey contact footer developer-login
    admin/      crud-manager profile-editor messages-manager image-field
  lib/          supabase.ts portfolio.ts i18n.tsx theme.tsx
  data/         types.ts fallback.ts
supabase/       schema.sql · seed.sql
```
