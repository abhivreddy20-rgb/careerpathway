import { supabase } from "./supabase";
import { buildPathway, type GradePlan, type PathwayTrack } from "../data/pathway";

export type CustomItem = { id: string; title: string; addedAt: number };

export type ProfileRecord = {
  current_grade: string | null;
  desired_profession: string | null;
  completed_items: string[];
  custom_items: CustomItem[];
};

export type PathwayBundle = {
  track: PathwayTrack;
  plans: GradePlan[];
  source: "openai" | "fallback";
};

export async function fetchProfile(): Promise<ProfileRecord | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("current_grade, desired_profession, completed_items, custom_items")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    current_grade: data.current_grade,
    desired_profession: data.desired_profession,
    completed_items: Array.isArray(data.completed_items)
      ? (data.completed_items as string[])
      : [],
    custom_items: Array.isArray(data.custom_items)
      ? (data.custom_items as CustomItem[])
      : [],
  };
}

export async function saveCompletedItems(userId: string, items: string[]) {
  const { error } = await supabase
    .from("profiles")
    .update({ completed_items: items, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw error;
}

export async function saveCustomItems(userId: string, items: CustomItem[]) {
  const { error } = await supabase
    .from("profiles")
    .update({ custom_items: items, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw error;
}

export async function loadPathway(
  currentGrade: string,
  desiredProfession: string,
): Promise<PathwayBundle> {
  const { data, error } = await supabase.functions.invoke<PathwayBundle>(
    "generate-pathway",
    { body: { currentGrade, desiredProfession } },
  );
  if (error || !data) {
    const local = buildPathway(currentGrade, desiredProfession);
    return { ...local, source: "fallback" };
  }
  return data;
}

export type Occupation = {
  onet_code: string;
  title: string;
  description: string | null;
  median_wage: number | null;
  education: string | null;
  outlook: string | null;
  skills: string[];
  related_titles: string[];
};

export type OccupationLookup = {
  profession_key: string;
  track: string;
  occupations: Occupation[];
  source: "onet" | "onet_empty" | "onet_unconfigured";
};

export async function lookupOccupation(
  profession: string,
): Promise<OccupationLookup | null> {
  const { data, error } = await supabase.functions.invoke<OccupationLookup>(
    "lookup-occupation",
    { body: { profession } },
  );
  if (error || !data) return null;
  return data;
}

export type College = {
  unitid: number;
  name: string;
  city: string | null;
  state: string | null;
  admission_rate: number | null;
  sat_avg: number | null;
  cost_attendance: number | null;
  size: number | null;
  url: string | null;
};

export type CollegeSearchInput = {
  state?: string;
  satMin?: number;
  satMax?: number;
  query?: string;
  limit?: number;
};

export type CollegeSearchResult = {
  colleges: College[];
  source: "scorecard" | "cache" | "unconfigured";
};

export async function searchColleges(
  input: CollegeSearchInput,
): Promise<CollegeSearchResult | null> {
  const { data, error } = await supabase.functions.invoke<CollegeSearchResult>(
    "search-colleges",
    { body: input },
  );
  if (error || !data) return null;
  return data;
}

export type SuggestedSkill = {
  name: string;
  description: string | null;
  importance: number | null;
  level: number | null;
};

export type SkillsSuggestion = {
  onet_code: string | null;
  occupation_title: string | null;
  skills: SuggestedSkill[];
  source: "onet" | "cache" | "onet_unconfigured" | "no_match";
};

export async function suggestSkills(input: {
  profession?: string;
  onetCode?: string;
}): Promise<SkillsSuggestion | null> {
  const { data, error } = await supabase.functions.invoke<SkillsSuggestion>(
    "suggest-skills",
    { body: input },
  );
  if (error || !data) return null;
  return data;
}
