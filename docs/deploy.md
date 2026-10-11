# Deploying Fire Hub (Vercel)

Fire Hub is hosted on Vercel's free **Hobby** plan, linked to the GitHub repo:

- every **pull request** gets a **preview** link (mock AI, no secrets);
- every merge to **`main`** redeploys **production**.

No custom domain: the default `*.vercel.app` address is fine.

## Environment variables (set in Vercel, never in the repo)

| Variable | Production | Preview | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | `https://zzrohkcygyrbdjpvseit.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | the publishable key (`sb_publishable_…`) |
| `AI_PROVIDER` | `groq` | `mock` | previews never spend the shared AI quota |
| `GROQ_MODEL` | ✅ | | e.g. `openai/gpt-oss-20b`. Check Groq's free models first |
| `GROQ_API_KEY` | ✅ only | ❌ | **secret**. A mentor pastes it in the Vercel dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ only | ❌ | **secret**. A mentor pastes it in the Vercel dashboard |

Because previews don't get the service role key, Ask the Hub and the admin
page show a "needs SUPABASE_SERVICE_ROLE_KEY" message there. Previews are for
checking UI changes; sign-in, the library and games work normally.

## Getting a free Groq key

1. Sign up at [console.groq.com](https://console.groq.com) (free, no card).
2. **API Keys → Create API Key**. Copy it once.
3. Paste it straight into Vercel (**Project → Settings → Environment Variables**,
   name `GROQ_API_KEY`, environment **Production** only). Don't put it in chat,
   a file, or a PR.
4. Check **Settings → Limits** in Groq to see which models your free plan allows,
   and set `GROQ_MODEL` to one of them.

## If Vercel blocks deploys from the organization repo

The Hobby plan deploys **public** organization repos. If it ever refuses, the
fallback is a GitHub Actions workflow that runs `vercel deploy --prod` on
pushes to `main`, using a `VERCEL_TOKEN` stored as an Actions secret. Ask a
mentor before switching.
