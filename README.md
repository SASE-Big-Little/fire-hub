# 🔥 Fire Hub

A small website for the **Fire group** in our mentorship program. Members:

- **keep shared resources** in one library (mentors approve new ones),
- **Ask the Hub**: an AI that answers *only* from those resources, and cites them,
- **play small games** that the group builds together.

Fire Hub is built by its members through GitHub pull requests. Mentors built the
base; **you** extend it by taking challenges from the [board below](#challenge-board).

**Stack:** Next.js (App Router) + TypeScript + Tailwind CSS · Supabase (database + sign-in)
· Vercel (hosting) · Groq (AI). Everything runs on free tiers.

---

## Setup (about 15 minutes)

You'll need:

- [Node.js](https://nodejs.org) **22** (the "LTS" download is fine). Check with `node -v`.
- [Git](https://git-scm.com/downloads) and a GitHub account that's in our organization.
- A code editor. [VS Code](https://code.visualstudio.com) is a good choice.
- A Fire Hub **username and password** from a mentor (nobody can sign up on their own).
- The **Supabase URL and anon key** from a mentor (they're safe to share with members,
  but please don't post them publicly).

### 1. Get the code

```bash
git clone https://github.com/SASE-Big-Little/fire-hub.git
cd fire-hub
npm install
```

### 2. Add your settings

Copy the example settings file:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
with the values from your mentor. **Leave everything else as it is.** In particular:

- keep `AI_PROVIDER=mock`, so Ask the Hub gives a pretend answer and doesn't
  use up the group's shared AI quota;
- you don't need `SUPABASE_SERVICE_ROLE_KEY`. Only mentors use it, for the admin page.

`.env.local` is ignored by git, so it never gets committed.

### 3. Run it

```bash
npm run dev
```

Open <http://localhost:3000> and sign in with the username and password from your mentor.
Edit any file and the page reloads by itself. 🎉

### 4. Before you open a PR

```bash
npm run lint       # code style
npm run typecheck  # TypeScript errors
npm test           # unit tests
npm run build      # does the whole site build?
```

GitHub runs the same four checks on every pull request.

### What works in this quick setup

Signing in, the resource library, submitting resources, and games all work.
**Ask the Hub and the admin page don't**, because they need the server's secret
key, which only lives in Vercel and on mentors' computers. Most challenges don't
need them. If yours does (challenges 9 to 23), do the full setup below.

### Full setup: your own practice database (another ~15 minutes)

Use this for challenges that touch Ask the Hub or the admin page. You get your
own free Supabase project, where you're the admin, so you can't break the real one.

1. Create a free account at [supabase.com](https://supabase.com) and a new project.
   The free plan is enough; don't add a payment method.
2. In your project, open **SQL Editor**. Paste and run each file in
   `supabase/migrations/`, oldest first.
3. Go to **Authentication → Sign In / Providers**: turn **off** "Allow new users to sign up"
   and "Confirm email", and set the minimum password length to 8.
4. From **Project Settings → API Keys**, copy the URL, the publishable key, and the
   **secret / service_role** key into your `.env.local`.
   The service role key is a secret: never commit it, paste it, or screenshot it.
5. Create your admin account: `npm run create-admin`
6. `npm run dev`, sign in, and add a few resources from the admin page to test with.
   Keep `AI_PROVIDER=mock` unless a mentor gives you a Groq key to try.

### Stuck?

- `command not found: npm`: install Node.js, then open a new terminal.
- The page says it can't reach Supabase: check the two values in `.env.local`
  (no quotes, no spaces), then stop `npm run dev` (Ctrl+C) and start it again.
- Still stuck: open a draft PR or ask in the group chat. That's what mentors are for.

---

## How to contribute

The short version (full guide in [CONTRIBUTING.md](CONTRIBUTING.md)):

1. Pick a challenge from the board below.
2. Claim it with a tiny PR that adds your name and "In progress" to its row.
3. Branch from `main` as `challenge-<number>-<short-name>`.
4. Open a draft PR early.
5. Fill in the PR template.
6. CI must pass.
7. A mentor reviews, explaining the why behind requested changes.
8. Squash and merge. The PR also flips the row to "Done".

## Where things live

```
app/                  pages and API routes (a folder = a URL)
  theme.css           ALL the colors, in one place
components/           reusable UI pieces
lib/
  ai.ts               the ONE function that talks to the AI model
  chunking.ts         splits resources into small pieces for search
  rate-limit.ts       "10 questions per hour" logic
  supabase/           database clients (browser, server, admin)
supabase/migrations/  database tables and security rules, as SQL
tests/                unit tests
docs/                 longer explanations
```

---

## Challenge board

Claim a challenge by opening a PR that puts your name in "Claimed by" and sets
Status to "In progress". Starter challenges are a great first PR.

| # | Challenge | Level | You'll learn | Claimed by | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Build a second game (memory match, hangman, or your own idea) | Starter | Components, state | | Open |
| 2 | Add a dark mode toggle that remembers the choice | Starter | CSS, local storage | | Open |
| 3 | Design the resource card: type icon, tags, and a clean layout | Starter | UI design | | Open |
| 4 | Curate 5 resources on "how to ask good questions" and submit them | Starter | Curation, the PR flow | | Open |
| 5 | Write the "Welcome" page: what the hub is and how to contribute | Starter | Writing, Markdown | | Open |
| 6 | Build a mentorship trivia game from a hand-written question list | Starter | Game logic | | Open |
| 7 | Add search and tag filters to the resource library | Starter | Queries, filtering | | Open |
| 8 | Design the Fire group logo and favicon | Starter | Visual design, assets | | Open |
| 9 | **Prompt lab:** write 3 system prompts for Ask the Hub, run all 3 on the same 10 questions, document which gives the most honest, cited answers | Intermediate | Prompt engineering | | Open |
| 10 | **Evaluation set:** 20 questions with the resource each should cite, plus a script that scores the AI's answers | Intermediate | Testing AI output | | Open |
| 11 | Show citations under each AI answer as clickable source chips | Intermediate | Using model output in UI | | Open |
| 12 | Have the model suggest tags and a one-line summary when a resource is submitted, editable by the mentor | Intermediate | AI-assisted workflows | | Open |
| 13 | Write a script that splits PDFs and notes into chunks for the database | Intermediate | Chunking, RAG basics | | Open |
| 14 | Stream AI answers word by word | Intermediate | Streaming APIs | | Open |
| 15 | Support follow-up questions by sending recent chat turns with each new question | Intermediate | Context windows | | Open |
| 16 | Show remaining AI questions and a friendly limit-reached message | Intermediate | Rate limits, UX | | Open |
| 17 | Add provider fallback in `lib/ai.ts` (Groq, then OpenRouter) | Stretch | API design, resilience | | Open |
| 18 | Replace keyword search with pgvector embeddings | Stretch | Embeddings, vector search | | Open |
| 19 | Add thumbs up/down on answers, plus a mentor page listing the worst-rated | Stretch | Feedback loops | | Open |
| 20 | Add guardrails against prompt injection and off-topic questions, tested with attack prompts | Stretch | AI safety basics | | Open |
| 21 | Run a small model in the browser (WebLLM) as a fallback when the shared quota runs out | Stretch | On-device AI | | Open |
| 22 | Generate quiz questions from an approved resource with the model | Stretch | Structured output | | Open |
| 23 | Run the evaluation set in CI against a mock model | Stretch | Testing, CI | | Open |
