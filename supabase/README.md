# Supabase setup

## 1. Frontend env

Copy `.env.example` to `.env.local` at the repo root and fill in:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY
```

Both values come from your Supabase dashboard: **Project Settings → API**.

## 2. Database schema

Open the Supabase dashboard → **SQL Editor** → **New query**, paste the contents of `supabase/schema.sql`, and run it. This creates `profiles` and `pathways` tables, RLS policies, and a trigger that auto-creates a profile row on signup.

## 3. Auth settings

Dashboard → **Authentication → Providers**: ensure **Email** is enabled. For development, you may want to disable "Confirm email" under **Authentication → Sign In / Up** so you can log in immediately after signup; re-enable it before going to production.

## 4. Edge functions

Install the Supabase CLI once:

```
brew install supabase/tap/supabase
supabase login
supabase link --project-ref YOUR-PROJECT-REF
```

Set provider keys as secrets (never commit them):

```
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set ONET_USERNAME=your-onet-username
supabase secrets set ONET_PASSWORD=your-onet-password
supabase secrets set COLLEGE_SCORECARD_API_KEY=...
```

Where to get the keys:
- **OpenAI** — https://platform.openai.com/api-keys
- **O*NET** — https://services.onetcenter.org/developer/email (free, immediate)
- **College Scorecard** — https://api.data.gov/signup/ (free, immediate)

Deploy the functions:

```
supabase functions deploy generate-pathway
supabase functions deploy search-colleges
supabase functions deploy suggest-skills
```

The frontend invokes these via `src/lib/api.ts`:

| Function           | Client fn        | Fills cache table             |
| ------------------ | ---------------- | ----------------------------- |
| `generate-pathway` | `loadPathway`    | `pathways` (per user)         |
| `search-colleges`  | `searchColleges` | `colleges`, `api_cache`       |
| `suggest-skills`   | `suggestSkills`  | `api_cache` (provider=`onet`) |

Each function checks its cache table before calling the upstream API, so repeat queries do not burn quota. If a provider key is unset, the function returns an empty/`unconfigured` result rather than erroring — the frontend should treat that as a graceful no-op.
