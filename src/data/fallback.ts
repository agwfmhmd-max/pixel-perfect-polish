import type { Education, Experience, Profile, Project, Skill, SocialLink, Stat } from "./types";

/**
 * Fallback content — used only when the database has no rows yet.
 * Edit here (or, better, from the admin dashboard) to change name, email, links...
 */

export const PLACEHOLDER = {
  email: "[YOUR EMAIL]",
  github: "[YOUR GITHUB]",
  linkedin: "[YOUR LINKEDIN]",
  whatsapp: "[YOUR WHATSAPP]",
};

export const fallbackProfile: Profile = {
  id: "fallback",
  full_name: "Mohamed Dah Agove",
  headline: "Banque & Assurance Student · Software Developer",
  bio: "Third-year Banque et Assurance student at ISCAE and Software Developer passionate about building useful digital solutions, web applications and management systems.",
  profile_image: null,
  email: PLACEHOLDER.email,
  phone: null,
  location: "Nouakchott, Mauritania",
  github_url: PLACEHOLDER.github,
  linkedin_url: PLACEHOLDER.linkedin,
  whatsapp_url: PLACEHOLDER.whatsapp,
};

export const fallbackEducation: Education[] = [
  {
    id: "e1",
    institution:
      "Institut Supérieur de Comptabilité et d'Administration des Entreprises (ISCAE)",
    degree: "Licence / Bachelor",
    field: "Banque et Assurance",
    description: "Third Year Student.",
    start_year: 2023,
    end_year: null,
    current: true,
    location: "Mauritania",
    sort_order: 1,
  },
];

export const fallbackExperience: Experience[] = [
  {
    id: "x1",
    organization: "Banque Centrale de Mauritanie",
    position: "Intern",
    department:
      "Direction Générale de la Supervision Bancaire et de la Stabilité Financière",
    description:
      "Internship within the Directorate in charge of banking supervision and financial stability, directly connected to the Banque et Assurance curriculum: banking regulation, supervision of financial institutions and financial stability.",
    start_date: "2026-01-01",
    end_date: null,
    current: false,
    location: "Nouakchott, Mauritania",
    sort_order: 1,
  },
];

const skill = (category: string, name: string, sort_order: number): Skill => ({
  id: `${category}-${name}`,
  category,
  name,
  level: null,
  icon: null,
  sort_order,
});

export const SKILL_CATEGORIES = [
  "Banking & Finance",
  "Development",
  "Database & Backend",
  "Tools",
] as const;

export const fallbackSkills: Skill[] = [
  ...[
    "Banking",
    "Insurance",
    "Financial Analysis",
    "Banking Supervision",
    "Financial Stability",
    "Accounting",
    "Risk Awareness",
  ].map((n, i) => skill("Banking & Finance", n, i)),
  ...["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "REST APIs"].map(
    (n, i) => skill("Development", n, i),
  ),
  ...["Supabase", "PostgreSQL", "MySQL", "Authentication", "Database Design"].map((n, i) =>
    skill("Database & Backend", n, i),
  ),
  ...["Git", "GitHub", "Vercel", "Cloudinary", "VS Code"].map((n, i) => skill("Tools", n, i)),
];

export const PROJECT_CATEGORIES = [
  "Web Development",
  "Education",
  "Management",
  "Finance",
  "Student Projects",
] as const;

export const fallbackProjects: Project[] = [
  {
    id: "p3",
    title: "Teyssir ERP",
    slug: "teyssir-erp",
    short_description: "Enterprise Resource Planning Platform.",
    full_description:
      "An ERP platform designed to help organisations manage their operations and information in a structured, modern and digital way.",
    category: "Management",
    image_url: null,
    live_url: "https://teyssir-erp.vercel.app",
    github_url: null,
    technologies: ["React", "TypeScript", "Supabase"],
    featured: true,
    sort_order: 1,
  },
  {
    id: "p1",
    title: "UNEM ISCAE",
    slug: "unem-iscae",
    short_description:
      "Plateforme de l'Union Nationale des Étudiants de Mauritanie – ISCAE.",
    full_description:
      "A digital platform for the National Union of Mauritanian Students at ISCAE, making information, services and communication with students easier to access.",
    category: "Education",
    image_url: null,
    live_url: "https://unem-iscae.vercel.app/",
    github_url: null,
    technologies: ["Next.js", "Supabase"],
    featured: false,
    sort_order: 2,
  },
  {
    id: "p2",
    title: "Revision BA & FC",
    slug: "revision-ba-fc",
    short_description: "Plateforme de révision pour les étudiants BA & FC.",
    full_description:
      "A revision platform for BA and FC students, providing a digital environment that helps students organise and review their courses.",
    category: "Student Projects",
    image_url: null,
    live_url: "https://revision-ba-fc.vercel.app/",
    github_url: null,
    technologies: ["React", "Supabase"],
    featured: false,
    sort_order: 3,
  },
  {
    id: "p4",
    title: "ResultatRIM",
    slug: "resultatrim",
    short_description: "National Competition Results Platform.",
    full_description:
      "A digital platform presenting the results of national competitions in Mauritania in a clear and organised way.",
    category: "Education",
    image_url: null,
    live_url: "https://resultatrim.vercel.app",
    github_url: null,
    technologies: ["React", "PostgreSQL"],
    featured: false,
    sort_order: 4,
  },
  {
    id: "p5",
    title: "ISCAE Promo 18",
    slug: "iscae-promo-18",
    short_description: "Plateforme de gestion de la cérémonie de graduation.",
    full_description:
      "A digital platform to manage and present information about the graduation of the 18th promotion of ISCAE.",
    category: "Student Projects",
    image_url: null,
    live_url: "https://iscae-promo-18.vercel.app/",
    github_url: null,
    technologies: ["Next.js", "Supabase"],
    featured: false,
    sort_order: 5,
  },
];

export const fallbackSocialLinks: SocialLink[] = [
  { id: "s1", platform: "GitHub", url: PLACEHOLDER.github, icon: "github", enabled: true, sort_order: 1 },
  { id: "s2", platform: "LinkedIn", url: PLACEHOLDER.linkedin, icon: "linkedin", enabled: true, sort_order: 2 },
  { id: "s3", platform: "Email", url: `mailto:${PLACEHOLDER.email}`, icon: "mail", enabled: true, sort_order: 3 },
];

/** Editable statistics shown in the Stats strip. */
export const STATS = [
  { value: "5+", key: "stats.projects" },
  { value: "1", key: "stats.internship" },
  { value: "1", key: "stats.journey" },
  { value: "∞", key: "stats.solutions" },
] as const;

/** Default stats rows — used only until the `stats` table has rows. */
export const fallbackStats: Stat[] = [
  { id: "st1", value: "5+", label: "Projects", label_fr: "Projets", label_ar: "مشاريع", sort_order: 1 },
  { id: "st2", value: "1", label: "Internship", label_fr: "Stage", label_ar: "تدريب", sort_order: 2 },
  {
    id: "st3",
    value: "1",
    label: "Academic Journey",
    label_fr: "Parcours académique",
    label_ar: "مسار أكاديمي",
    sort_order: 3,
  },
  {
    id: "st4",
    value: "∞",
    label: "Digital Solutions",
    label_fr: "Solutions numériques",
    label_ar: "حلول رقمية",
    sort_order: 4,
  },
];
