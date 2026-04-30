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
