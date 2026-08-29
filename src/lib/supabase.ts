import { createClient } from "@supabase/supabase-js";

/**
 * Public (publishable) credentials only. Never put a service-role key here.
 * Override with VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY if needed.
 */
export const SUPABASE_URL =
  import.meta.env['VITE_SUPABASE_URL'] ?? "https://atwgaoplzoajisfjagkl.supabase.co";

export const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] ??
  "sb_publishable_wKS9wqibuTvVgUH9lK-kCQ_czRHnbnY";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createClient<any>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: "mda-portfolio-auth",
  },
});
