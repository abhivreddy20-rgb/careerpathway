import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL ?? "";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

export type Profile = {
  id: string;
  full_name: string | null;
  current_grade: string | null;
  desired_profession: string | null;
  updated_at: string;
};

export type PathwayRow = {
  id: string;
  user_id: string;
  current_grade: string;
  desired_profession: string;
  track: string;
  plans: unknown;
  source: "openai" | "fallback";
  created_at: string;
};
