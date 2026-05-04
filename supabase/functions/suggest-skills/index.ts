// Supabase Edge Function: suggest-skills
// Returns the top in-demand skills for an O*NET occupation, including
// per-skill importance/level scores and a human description.
//
// Body: { onetCode?: string, profession?: string }   (one of the two required)
// Returns: {
//   onet_code: string | null,
//   occupation_title: string | null,
//   skills: Skill[],
//   source: "onet" | "cache" | "onet_unconfigured" | "no_match"
// }
//
// Env vars required:
//   ONET_USERNAME, ONET_PASSWORD  (free signup at onetcenter.org/developer)

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CORS, jsonResponse } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ONET_USERNAME = Deno.env.get("ONET_USERNAME");
const ONET_PASSWORD = Deno.env.get("ONET_PASSWORD");

const ONET_BASE = "https://services.onetcenter.org/ws/online";
const CACHE_TTL_DAYS = 30;
const TOP_SKILLS = 12;

type Skill = {
  name: string;
  description: string | null;
  importance: number | null; // 0-100, higher = more important to the role
  level: number | null;      // 0-100, proficiency level expected
};

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

async function searchTopCode(profession: string): Promise<string | null> {
  const data = await onetGet(
    `/search?keyword=${encodeURIComponent(profession)}&end=1`,
  );
  const list = data?.occupation ?? data?.career ?? [];
  return list[0]?.code ?? null;
}

// Pulls per-skill importance+level. The detail endpoint returns one
// row per skill with its scale scores; we keep the highest-importance ones.
async function fetchSkills(code: string): Promise<{
  title: string | null;
  skills: Skill[];
} | null> {
  const [summary, details] = await Promise.all([
    onetGet(`/occupations/${code}/summary`),
    onetGet(`/occupations/${code}/details/skills`),
  ]);
  if (!details) return null;

  const elements: any[] = details?.element ?? [];
  const skills: Skill[] = elements
    .map((el) => {
      const scales: any[] = el?.score ?? [];
      const importanceRaw = scales.find((s) => s?.scale === "IM")?.value;
      const levelRaw = scales.find((s) => s?.scale === "LV")?.value;
      // O*NET importance is 1-5; level is 0-7. Normalize both to 0-100.
      const importance =
        typeof importanceRaw === "number"
          ? Math.round(((importanceRaw - 1) / 4) * 100)
          : null;
      const level =
        typeof levelRaw === "number" ? Math.round((levelRaw / 7) * 100) : null;
      return {
        name: el?.name ?? null,
        description: el?.description ?? null,
        importance,
        level,
      } as Skill & { name: string | null };
    })
    .filter((s): s is Skill => Boolean(s.name))
    .sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0))
    .slice(0, TOP_SKILLS);

  return {
    title: summary?.title ?? null,
    skills,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST")
    return jsonResponse({ error: "method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return jsonResponse({ error: "missing auth" }, 401);

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user)
    return jsonResponse({ error: "unauthorized" }, 401);

  if (!ONET_USERNAME || !ONET_PASSWORD) {
    return jsonResponse({
      onet_code: null,
      occupation_title: null,
      skills: [],
      source: "onet_unconfigured",
    });
  }

  let body: { onetCode?: string; profession?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "bad json" }, 400);
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Resolve the O*NET code: prefer caller-provided, otherwise look up the
  // profession via the shared `profession_lookup` cache, falling back to a
  // fresh O*NET search.
  let code = (body.onetCode ?? "").trim();
  const profession = (body.profession ?? "").toString().trim();

  if (!code && profession) {
    const key = professionKey(profession);
    const lookup = await admin
      .from("profession_lookup")
      .select("onet_codes")
      .eq("profession_key", key)
      .maybeSingle();
    code = lookup.data?.onet_codes?.[0] ?? "";
    if (!code) {
      const found = await searchTopCode(profession);
      code = found ?? "";
    }
  }

  if (!code) {
    return jsonResponse({
      onet_code: null,
      occupation_title: null,
      skills: [],
      source: "no_match",
    });
  }

  const cacheKey = `onet_skills:${code}`;
  const cached = await admin
    .from("api_cache")
    .select("payload, fetched_at")
    .eq("provider", "onet")
    .eq("cache_key", cacheKey)
    .maybeSingle();

  const fresh =
    cached.data &&
    Date.now() - new Date(cached.data.fetched_at).getTime() <
      CACHE_TTL_DAYS * 86_400_000;

  if (fresh && cached.data) {
    return jsonResponse({ ...cached.data.payload, source: "cache" });
  }

  const fetched = await fetchSkills(code);
  if (!fetched) {
    return jsonResponse({
      onet_code: code,
      occupation_title: null,
      skills: [],
      source: "no_match",
    });
  }

  const payload = {
    onet_code: code,
    occupation_title: fetched.title,
    skills: fetched.skills,
  };

  await admin.from("api_cache").upsert(
    {
      provider: "onet",
      cache_key: cacheKey,
      payload,
      fetched_at: new Date().toISOString(),
    },
    { onConflict: "provider,cache_key" },
  );

  return jsonResponse({ ...payload, source: "onet" });
});
