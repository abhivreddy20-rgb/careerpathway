// Supabase Edge Function: search-colleges
// Queries the U.S. Dept. of Education College Scorecard API and caches
// results in `colleges` (per school) and `api_cache` (per query).
//
// Body: { state?: string, satMin?: number, satMax?: number, query?: string, limit?: number }
// Returns: { colleges: College[], source: "scorecard" | "cache" | "unconfigured" }
//
// Env vars required:
//   COLLEGE_SCORECARD_API_KEY  (free at api.data.gov/signup/)

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CORS, jsonResponse } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SCORECARD_KEY = Deno.env.get("COLLEGE_SCORECARD_API_KEY");

const SCORECARD_BASE = "https://api.data.gov/ed/collegescorecard/v1/schools";
const CACHE_TTL_DAYS = 7;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

const FIELDS = [
  "id",
  "school.name",
  "school.city",
  "school.state",
  "school.school_url",
  "latest.admissions.admission_rate.overall",
  "latest.admissions.sat_scores.average.overall",
  "latest.cost.attendance.academic_year",
  "latest.student.size",
].join(",");

type College = {
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

type Query = {
  state?: string;
  satMin?: number;
  satMax?: number;
  query?: string;
  limit?: number;
};

function buildCacheKey(q: Query): string {
  const parts = [
    q.state ? `st=${q.state.toUpperCase()}` : "",
    q.satMin ? `satMin=${q.satMin}` : "",
    q.satMax ? `satMax=${q.satMax}` : "",
    q.query ? `q=${q.query.toLowerCase().trim()}` : "",
    `limit=${Math.min(q.limit ?? DEFAULT_LIMIT, MAX_LIMIT)}`,
  ].filter(Boolean);
  return parts.join("&") || "all";
}

function buildScorecardUrl(q: Query): string {
  const params = new URLSearchParams({
    api_key: SCORECARD_KEY!,
    fields: FIELDS,
    per_page: String(Math.min(q.limit ?? DEFAULT_LIMIT, MAX_LIMIT)),
    "school.operating": "1",
  });
  if (q.state) params.set("school.state", q.state.toUpperCase());
  if (q.satMin)
    params.set("latest.admissions.sat_scores.average.overall__range", `${q.satMin}..${q.satMax ?? ""}`);
  else if (q.satMax)
    params.set("latest.admissions.sat_scores.average.overall__range", `..${q.satMax}`);
  if (q.query) params.set("school.name", q.query);
  return `${SCORECARD_BASE}?${params.toString()}`;
}

function flatten(row: any): College | null {
  if (!row?.id || !row?.["school.name"]) return null;
  return {
    unitid: row.id,
    name: row["school.name"],
    city: row["school.city"] ?? null,
    state: row["school.state"] ?? null,
    admission_rate: row["latest.admissions.admission_rate.overall"] ?? null,
    sat_avg: row["latest.admissions.sat_scores.average.overall"] ?? null,
    cost_attendance: row["latest.cost.attendance.academic_year"] ?? null,
    size: row["latest.student.size"] ?? null,
    url: row["school.school_url"] ?? null,
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

  if (!SCORECARD_KEY) {
    return jsonResponse({ colleges: [], source: "unconfigured" });
  }

  let body: Query = {};
  try {
    body = (await req.json()) ?? {};
  } catch {
    return jsonResponse({ error: "bad json" }, 400);
  }

  const cacheKey = buildCacheKey(body);
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const cached = await admin
    .from("api_cache")
    .select("payload, fetched_at")
    .eq("provider", "scorecard")
    .eq("cache_key", cacheKey)
    .maybeSingle();

  const fresh =
    cached.data &&
    Date.now() - new Date(cached.data.fetched_at).getTime() <
      CACHE_TTL_DAYS * 86_400_000;

  if (fresh && cached.data) {
    return jsonResponse({ colleges: cached.data.payload, source: "cache" });
  }

  const res = await fetch(buildScorecardUrl(body));
  if (!res.ok) {
    return jsonResponse({ error: "scorecard upstream", status: res.status }, 502);
  }
  const json = await res.json();
  const colleges: College[] = (json?.results ?? [])
    .map(flatten)
    .filter((c: College | null): c is College => c !== null);

  // Cache the query result and individual schools.
  await admin.from("api_cache").upsert(
    {
      provider: "scorecard",
      cache_key: cacheKey,
      payload: colleges,
      fetched_at: new Date().toISOString(),
    },
    { onConflict: "provider,cache_key" },
  );

  if (colleges.length > 0) {
    await admin.from("colleges").upsert(
      colleges.map((c) => ({
        unitid: c.unitid,
        name: c.name,
        city: c.city,
        state: c.state,
        admission_rate: c.admission_rate,
        sat_avg: c.sat_avg,
        cost_attendance: c.cost_attendance,
        size: c.size,
        url: c.url,
        raw: c,
        fetched_at: new Date().toISOString(),
      })),
      { onConflict: "unitid" },
    );
  }

  return jsonResponse({ colleges, source: "scorecard" });
});
