import { supabase } from "./supabase";
import type { GradePlan, PathwayTrack } from "../data/pathway";

export type CustomItem = { id: string; title: string; addedAt: number };

// Per-profession buckets. Keys are the profession name as the user typed it.
export type CompletedMap = Record<string, string[]>;
export type CustomMap = Record<string, CustomItem[]>;

export type ProfileRecord = {
  current_grade: string | null;
  desired_profession: string | null;
  secondary_profession: string | null;
  active_profession: string | null;
  completed_items: CompletedMap;
  custom_items: CustomMap;
};

export type PathwayBundle = {
  track: PathwayTrack;
  plans: GradePlan[];
  source: "openai" | "fallback";
};

// Old rows may still hold a flat array if the migration hasn't run yet — coerce
// to the keyed shape so the app keeps working either way.
function coerceCompleted(raw: unknown, fallbackKey: string | null): CompletedMap {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as CompletedMap;
  }
  if (Array.isArray(raw) && fallbackKey) {
    return { [fallbackKey]: raw as string[] };
  }
  return {};
}

function coerceCustom(raw: unknown, fallbackKey: string | null): CustomMap {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as CustomMap;
  }
  if (Array.isArray(raw) && fallbackKey) {
    return { [fallbackKey]: raw as CustomItem[] };
  }
  return {};
}

export async function fetchProfile(): Promise<ProfileRecord | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "current_grade, desired_profession, secondary_profession, active_profession, completed_items, custom_items",
    )
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    current_grade: data.current_grade,
    desired_profession: data.desired_profession,
    secondary_profession: data.secondary_profession ?? null,
    active_profession: data.active_profession ?? data.desired_profession ?? null,
    completed_items: coerceCompleted(data.completed_items, data.desired_profession),
    custom_items: coerceCustom(data.custom_items, data.desired_profession),
  };
}

export async function saveCompletedItems(
  userId: string,
  profession: string,
  items: string[],
  current: CompletedMap,
) {
  const next: CompletedMap = { ...current, [profession]: items };
  const { error } = await supabase
    .from("profiles")
    .update({ completed_items: next, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw error;
}

export async function saveCustomItems(
  userId: string,
  profession: string,
  items: CustomItem[],
  current: CustomMap,
) {
  const next: CustomMap = { ...current, [profession]: items };
  const { error } = await supabase
    .from("profiles")
    .update({ custom_items: next, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw error;
}

export async function setActiveProfession(userId: string, profession: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ active_profession: profession, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw error;
}

export async function setSecondaryProfession(
  userId: string,
  profession: string | null,
) {
  const { error } = await supabase
    .from("profiles")
    .update({
      secondary_profession: profession,
      updated_at: new Date().toISOString(),
    })
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
  if (error) throw error;
  if (!data) throw new Error("No pathway returned from server.");
  return data;
}

export type College = {
  unitid: number;
  name: string;
  city: string | null;
  state: string | null;
  admission_rate: number | null;
  sat_avg: number | null;
  sat_reading_25: number | null;
  sat_reading_75: number | null;
  sat_math_25: number | null;
  sat_math_75: number | null;
  act_25: number | null;
  act_75: number | null;
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
  cipCodes?: string[]; // 2-digit CIP codes; OR'd against each school's programs
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

export type AdmitProfileEC = { name: string; why: string };

export type AdmitProfile = {
  college: string;
  unitid: number | null;
  gpa_avg: string | null;
  gpa_range: string | null;
  course_rigor: string | null;
  top_ecs: AdmitProfileEC[];
  advice: string | null;
  disclaimer: string;
  source: "openai" | "cache" | "unconfigured" | "no_match";
};

export async function fetchAdmitProfile(input: {
  college: string;
  unitid?: number;
  state?: string;
}): Promise<AdmitProfile | null> {
  const { data, error } = await supabase.functions.invoke<AdmitProfile>(
    "admit-profile",
    { body: input },
  );
  if (error || !data) return null;
  return data;
}
