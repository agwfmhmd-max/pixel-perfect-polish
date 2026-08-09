/**
 * Translated columns: every localized text field has `_fr` and `_ar` siblings.
 * The base column holds the English (default) value and is used as fallback.
 */
type Translated<K extends string> = Partial<
  Record<`${K}_fr` | `${K}_ar`, string | null>
>;

export type Profile = Translated<"full_name" | "headline" | "bio" | "location"> & {
  id: string;
  full_name: string;
  headline: string;
  bio: string;
  profile_image: string | null;
  email: string;
  phone: string | null;
  location: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  whatsapp_url: string | null;
  updated_at?: string;
};

export type Education = Translated<
  "institution" | "degree" | "field" | "level" | "description" | "location"
> & {
  id: string;
  institution: string;
  degree: string;
  field: string | null;
  /** Academic level, e.g. "Third Year" — fully editable from the dashboard. */
  level?: string | null;
  description: string | null;
  start_year: number | null;
  end_year: number | null;
  /** Optional exact dates; when present they take priority over the years. */
  start_date?: string | null;
  end_date?: string | null;
  current: boolean;
  location: string | null;
  sort_order: number;
};

export type Stat = Translated<"label"> & {
  id: string;
  value: string;
  label: string;
  sort_order: number;
};

export type Experience = Translated<"organization" | "position" | "department" | "description" | "location"> & {
  id: string;
  organization: string;
  position: string;
  department: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  current: boolean;
  location: string | null;
  sort_order: number;
};

export type Skill = Translated<"category" | "name"> & {
  id: string;
  category: string;
  name: string;
  level: number | null;
  icon: string | null;
  sort_order: number;
};

export type Project = Translated<
  "title" | "short_description" | "full_description" | "category" | "problem" | "solution" | "features"
> & {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  full_description: string | null;
  /** Project detail blocks, all editable from the dashboard. */
  problem?: string | null;
  solution?: string | null;
  features?: string | null;
  category: string;
  image_url: string | null;
  live_url: string | null;
  github_url: string | null;
  technologies: string[];
  featured: boolean;
  sort_order: number;
};

export type SocialLink = Translated<"platform"> & {
  id: string;
  platform: string;
  url: string;
  icon: string | null;
  enabled: boolean;
  sort_order: number;
};

export type SiteSettings = Translated<"site_title" | "site_description"> & {
  id: string;
  site_title: string;
  site_description: string;
  primary_color: string | null;
  accent_color: string | null;
  favicon_url: string | null;
};

export type Message = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  read: boolean;
  created_at: string;
};
