import { supabase } from "@/lib/supabase";
import {
  fallbackEducation,
  fallbackExperience,
  fallbackProfile,
  fallbackProjects,
  fallbackSkills,
  fallbackSocialLinks,
  fallbackStats,
} from "@/data/fallback";

/**
 * Imports the built-in default content into the database.
 *
 * Anything the site shows before the tables are filled comes from
 * `src/data/fallback.ts` and therefore cannot be edited. Running this once
 * turns every visible item (projects, education, experience, skills, social
 * links, profile, stats) into a real, fully editable database row.
 *
 * Only empty tables are filled — existing content is never touched.
 */
export type ImportReport = Record<string, number>;

async function isEmpty(table: string) {
  const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
  if (error) throw error;
  return (count ?? 0) === 0;
}

function strip<T extends { id: string }>(row: T) {
  const { id: _id, ...rest } = row;
  return rest as Omit<T, "id">;
}

async function fill(table: string, rows: Record<string, unknown>[]): Promise<number> {
  if (rows.length === 0) return 0;
  if (!(await isEmpty(table))) return 0;
  const { error } = await supabase.from(table).insert(rows as never);
  if (error) throw error;
  return rows.length;
}

export async function importDefaultContent(): Promise<ImportReport> {
  const report: ImportReport = {};

  report['profile'] = await fill("profile", [strip(fallbackProfile)]);
  report['education'] = await fill(
    "education",
    fallbackEducation.map((e) => ({ ...strip(e), level: "Third Year" })),
  );
  report['experience'] = await fill("experience", fallbackExperience.map(strip));
  report['skills'] = await fill("skills", fallbackSkills.map(strip));
  report['projects'] = await fill("projects", fallbackProjects.map(strip));
  report['social_links'] = await fill("social_links", fallbackSocialLinks.map(strip));
  report['stats'] = await fill("stats", fallbackStats.map(strip));

  return report;
}
