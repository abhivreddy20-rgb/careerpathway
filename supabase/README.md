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

## 4. Edge function (OpenAI proxy)

Install the Supabase CLI once:

```
brew install supabase/tap/supabase
supabase login
supabase link --project-ref YOUR-PROJECT-REF
```

Set the OpenAI key as a secret (do not commit it):

```
supabase secrets set OPENAI_API_KEY=sk-...
```

Deploy the function:

```
supabase functions deploy generate-pathway
```

The frontend calls it via `supabase.functions.invoke("generate-pathway", ...)` from `src/lib/api.ts`. If the function fails or `OPENAI_API_KEY` is unset, the client falls back to the local `buildPathway` template.
