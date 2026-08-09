import { useQuery } from "@tanstack/react-query";
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
import type { Education, Experience, Profile, Project, Skill, SocialLink, Stat } from "@/data/types";

async function selectAll<T>(table: string, order: string): Promise<T[] | null> {
  const { data, error } = await supabase.from(table).select("*").order(order, { ascending: true });
  if (error || !data || data.length === 0) return null;
  return data as T[];
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<Profile> => {
      const { data } = await supabase.from("profile").select("*").limit(1).maybeSingle();
      return (data as Profile | null) ?? fallbackProfile;
    },
    initialData: fallbackProfile,
  });
}

export function useEducation() {
  return useQuery({
    queryKey: ["education"],
    queryFn: async () => (await selectAll<Education>("education", "sort_order")) ?? fallbackEducation,
    initialData: fallbackEducation,
  });
}

export function useExperience() {
  return useQuery({
    queryKey: ["experience"],
    queryFn: async () =>
      (await selectAll<Experience>("experience", "sort_order")) ?? fallbackExperience,
    initialData: fallbackExperience,
  });
}

export function useSkills() {
  return useQuery({
    queryKey: ["skills"],
    queryFn: async () => (await selectAll<Skill>("skills", "sort_order")) ?? fallbackSkills,
    initialData: fallbackSkills,
  });
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const rows = await selectAll<Project>("projects", "sort_order");
      return (rows ?? fallbackProjects).map((p) => ({
        ...p,
        technologies: Array.isArray(p.technologies) ? p.technologies : [],
      }));
    },
    initialData: fallbackProjects,
  });
}

export function useSocialLinks() {
  return useQuery({
    queryKey: ["social_links"],
    queryFn: async () => {
      const rows = await selectAll<SocialLink>("social_links", "sort_order");
      return (rows ?? fallbackSocialLinks).filter((l) => l.enabled);
    },
    initialData: fallbackSocialLinks,
  });
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => (await selectAll<Stat>("stats", "sort_order")) ?? fallbackStats,
    initialData: fallbackStats,
  });
}
