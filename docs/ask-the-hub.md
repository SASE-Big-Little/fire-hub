# How Ask the Hub works

Ask the Hub is **not** a general chatbot. It answers only from resources the
group has approved. This pattern is called *retrieval-augmented generation* (RAG).

```
question
  │
  ├─ signed in? under 10 questions this hour?        (app/api/ask/route.ts, lib/rate-limit.ts)
  │
  ├─ full-text search our chunks, top 5               (search_chunks() in supabase/migrations)
  │     └─ no match → "the hub has no resource on that yet". The model is NOT called.
  │
  ├─ send the system prompt + ONLY those chunks       (lib/ask.ts)
  │     to the model                                  (askModel() in lib/ai.ts)
  │
  └─ answer + the resources it cited ([1], [2]...)
```

## Where the text comes from

When a mentor approves a resource, its summary and content are split into
chunks of about 800 characters (`lib/chunking.ts`) and saved in the `chunks`
table. Postgres builds a search index over them automatically.

## Mock mode

`AI_PROVIDER=mock` (the default) returns a canned answer and never calls a
real model. Local development, tests, CI and Vercel previews all use it, so
they never spend the group's shared free quota. Only production uses
`AI_PROVIDER=groq`.

## The model

`lib/ai.ts` calls Groq's OpenAI-compatible API with the model in `GROQ_MODEL`.
Free models and their limits change often, so check the
[Groq models](https://console.groq.com/docs/models) and
[rate limits](https://console.groq.com/docs/rate-limits) pages, and your own
account's **Settings → Limits** page, before changing it. If Groq says
"too many requests", members see a friendly "try again in a few minutes".

## Ideas to improve it

Challenges 9, 10, 11, 14, 15, 16, 17, 18, 20, 21 and 23 on the board all build on this.
