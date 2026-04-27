// Supabase Edge Function: generate-pathway
// Deploy: supabase functions deploy generate-pathway --no-verify-jwt=false
// Set secret: supabase secrets set OPENAI_API_KEY=sk-...
//
// Body: { currentGrade: string, desiredProfession: string }
// Returns: { track, plans, source: "openai" | "fallback" }

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GRADE_LABELS: Record<string, string> = {
  "9": "9th Grade",
  "10": "10th Grade",
  "11": "11th Grade",
  "12": "12th Grade",
  college: "College / University",
  other: "Your Path",
};

function gradeSequence(grade: string): string[] {
  if (grade === "college") return ["college"];
  const n = parseInt(grade, 10);
  if (!isNaN(n) && n >= 9 && n <= 12) {
    const seq: string[] = [];
    for (let g = n; g <= 12; g++) seq.push(String(g));
    return seq;
  }
  return ["9", "10", "11", "12"];
}

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

function fallbackPlans(grade: string) {
  return gradeSequence(grade).map((g) => ({
    gradeValue: g,
    label: GRADE_LABELS[g] ?? g,
    courses: [
      "Core math course for your level",
      "A science course aligned to your goal",
      "English / writing-intensive course",
      "An elective in your interest area",
    ],
    activities: [
      "Join one club tied to your goal",
      "Shadow a professional in the field",
      "Lead a small project end-to-end",
    ],
    volunteer: [
      "Consistent monthly service at one org",
      "Mentor a younger student",
    ],
    skills: [
      "Time management and planning",
      "Public speaking basics",
      "One tool widely used in your field",
    ],
  }));
}

async function generateWithOpenAI(grade: string, profession: string) {
  if (!OPENAI_API_KEY) return null;
  const sequence = gradeSequence(grade);
  const prompt = `You build personalized academic-career roadmaps for students.

Student current grade: ${GRADE_LABELS[grade] ?? grade}
Desired profession: ${profession}
Plan grades to cover (in order): ${sequence.join(", ")}

For EACH grade in that list, return a JSON object with these arrays of short, concrete recommendations:
- courses (4 items): specific course names appropriate for that grade
- activities (3 items): clubs, competitions, projects, internships, etc.
- volunteer (2 items): service work that builds the profile
- skills (3 items): practical skills, tools, or certifications

Return ONLY valid JSON in this exact shape, no prose:
{
  "track": "Technology" | "Healthcare" | "Creative" | "Science" | "Education" | "Business" | "General",
  "plans": [{"gradeValue":"<grade>","label":"<human label>","courses":[],"activities":[],"volunteer":[],"skills":[]}]
}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You output strict JSON only." },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) return null;
  try {
    const parsed = JSON.parse(content);
    if (!parsed?.plans || !Array.isArray(parsed.plans)) return null;
    return parsed;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: CORS });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "missing auth" }), {
      status: 401,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
  const userId = userData.user.id;

  let body: { currentGrade?: string; desiredProfession?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "bad json" }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
  const grade = (body.currentGrade ?? "").toString();
  const profession = (body.desiredProfession ?? "").toString().trim();
  if (!grade || !profession) {
    return new Response(JSON.stringify({ error: "missing fields" }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const cached = await supabase
    .from("pathways")
    .select("track, plans, source")
    .eq("user_id", userId)
    .eq("current_grade", grade)
    .eq("desired_profession", profession)
    .maybeSingle();

  if (cached.data) {
    return new Response(JSON.stringify(cached.data), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const ai = await generateWithOpenAI(grade, profession);
  const result = ai
    ? { track: ai.track ?? detectTrack(profession), plans: ai.plans, source: "openai" as const }
    : {
        track: detectTrack(profession),
        plans: fallbackPlans(grade),
        source: "fallback" as const,
      };

  await supabase.from("pathways").upsert(
    {
      user_id: userId,
      current_grade: grade,
      desired_profession: profession,
      track: result.track,
      plans: result.plans,
      source: result.source,
    },
    { onConflict: "user_id,current_grade,desired_profession" },
  );

  return new Response(JSON.stringify(result), {
    headers: { ...CORS, "Content-Type": "application/json" },
  });
});
