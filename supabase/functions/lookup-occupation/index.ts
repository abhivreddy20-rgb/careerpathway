// Supabase Edge Function: lookup-occupation
// Resolves a free-text profession (e.g. "software engineer") to O*NET
// occupations and returns title, description, skills, education, wages.
//
// Body: { profession: string }
// Returns: { profession_key, track, occupations: Occupation[] }
//
// Env vars required:
//   ONET_USERNAME, ONET_PASSWORD  (free signup at onetcenter.org/developer)
// Falls back to a static-shape response if O*NET is not configured so the
// frontend always renders something.

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CORS, jsonResponse } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ONET_USERNAME = Deno.env.get("ONET_USERNAME");
const ONET_PASSWORD = Deno.env.get("ONET_PASSWORD");

const ONET_BASE = "https://services.onetcenter.org/ws/online";
const TOP_N = 3;
const CACHE_TTL_DAYS = 30;

type Occupation = {
  onet_code: string;
  title: string;
  description: string | null;
  median_wage: number | null;
  education: string | null;
  outlook: string | null;
  skills: string[];
  related_titles: string[];
};

function detectTrack(profession: string): string {
  const p = profession.toLowerCase();
  if (/(software|engineer|developer|programmer|data|machine learning|\bai\b|computer|cyber|devops|robotics)/.test(p))
    return "Technology";
  if (/(doctor|physician|nurse|medic|surgeon|dent|pharmac|therap|health|psych|vet|paramedic)/.test(p))
    return "Healthcare";
  if (/(design|artist|creative|\bux\b|\bui\b|illustrat|graphic|writer|musician|filmmaker|architect|photograph)/.test(p))
    return "Creative";
  if (/(scientist|biolog|chem|physic|research|environment|astron|geolog|mathemat|biomedical)/.test(p))
    return "Science";
  if (/(teach|educ|professor|tutor|counselor)/.test(p)) return "Education";
  if (/(business|entrepreneur|finance|accountant|consult|market|manager|sales|analyst|economist|banker)/.test(p))
    return "Business";
  return "General";
}

function professionKey(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

function onetAuthHeader(): string {
  return "Basic " + btoa(`${ONET_USERNAME}:${ONET_PASSWORD}`);
}

async function onetGet(path: string): Promise<any | null> {
  if (!ONET_USERNAME || !ONET_PASSWORD) return null;
  const res = await fetch(`${ONET_BASE}${path}`, {
    headers: {
      Authorization: onetAuthHeader(),
      Accept: "application/json",
    },
  });
  if (!res.ok) return null;
  return res.json();
}

async function searchCodes(profession: string): Promise<string[]> {
  const data = await onetGet(`/search?keyword=${encodeURIComponent(profession)}&end=${TOP_N}`);
  const list = data?.occupation ?? data?.career ?? [];
  return list.slice(0, TOP_N).map((o: any) => o.code).filter(Boolean);
}

async function fetchSummary(code: string): Promise<Occupation | null> {
  const summary = await onetGet(`/occupations/${code}/summary`);
  if (!summary) return null;

  const skills = (summary?.knowledge?.element ?? [])
    .concat(summary?.skills?.element ?? [])
    .slice(0, 8)
    .map((s: any) => s.name)
    .filter(Boolean);

  const related = (summary?.related_occupations?.occupation ?? [])
    .slice(0, 5)
    .map((r: any) => r.title)
    .filter(Boolean);

  return {
    onet_code: code,
    title: summary?.title ?? code,
    description: summary?.description ?? null,
    median_wage: summary?.job_outlook?.salary?.annual_median ?? null,
    education: summary?.education?.job_zone?.education ?? null,
    outlook: summary?.job_outlook?.outlook?.category ?? null,
    skills,
    related_titles: related,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return jsonResponse({ error: "method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return jsonResponse({ error: "missing auth" }, 401);

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) return jsonResponse({ error: "unauthorized" }, 401);

  let body: { profession?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "bad json" }, 400);
  }
  const profession = (body.profession ?? "").toString().trim();
  if (!profession) return jsonResponse({ error: "missing profession" }, 400);

  const key = professionKey(profession);
  const track = detectTrack(profession);

  // Service-role client: bypass RLS for shared cache writes.
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // 1) profession_lookup hit?
  const lookup = await admin
    .from("profession_lookup")
    .select("onet_codes, track, fetched_at")
    .eq("profession_key", key)
    .maybeSingle();

  let codes: string[] = [];
  const fresh =
    lookup.data &&
    Date.now() - new Date(lookup.data.fetched_at).getTime() <
      CACHE_TTL_DAYS * 86_400_000;

  if (fresh && lookup.data) {
    codes = lookup.data.onet_codes ?? [];
  } else {
    codes = await searchCodes(profession);
    if (codes.length > 0) {
      await admin.from("profession_lookup").upsert(
        { profession_key: key, onet_codes: codes, track, fetched_at: new Date().toISOString() },
        { onConflict: "profession_key" },
      );
    }
  }

  if (codes.length === 0) {
    return jsonResponse({
      profession_key: key,
      track,
      occupations: [],
      source: ONET_USERNAME ? "onet_empty" : "onet_unconfigured",
    });
  }

  // 2) hydrate occupations: cache hit per code, fetch on miss.
  const cached = await admin
    .from("occupations")
    .select("onet_code, title, description, median_wage, education, outlook, skills, related_titles, fetched_at")
    .in("onet_code", codes);

  const cachedMap = new Map<string, Occupation & { fetched_at: string }>();
  for (const row of cached.data ?? []) {
    cachedMap.set(row.onet_code, row as any);
  }

  const occupations: Occupation[] = [];
  for (const code of codes) {
    const hit = cachedMap.get(code);
    const fresh =
      hit && Date.now() - new Date(hit.fetched_at).getTime() < CACHE_TTL_DAYS * 86_400_000;
    if (fresh && hit) {
      const { fetched_at: _omit, ...rest } = hit;
      occupations.push(rest);
      continue;
    }
    const fetched = await fetchSummary(code);
    if (!fetched) continue;
    occupations.push(fetched);
    await admin.from("occupations").upsert(
      { ...fetched, raw: fetched, fetched_at: new Date().toISOString() },
      { onConflict: "onet_code" },
    );
  }

  return jsonResponse({
    profession_key: key,
    track,
    occupations,
    source: "onet",
  });
});
