# Contributing to Fire Hub

Welcome! Fire Hub is built by the Fire group, one pull request (PR) at a time.
You don't need to be an expert. Pick something small, ask questions early,
and learn from the review.

## The contribution path

1. **Pick a challenge** from the [challenge board](README.md#challenge-board) in the README.
2. **Claim it** with a tiny PR that only adds your name and `In progress` to its row.
   This tells everyone it's taken.
3. **Branch from `main`** and name the branch `challenge-<number>-<short-name>`:
   ```bash
   git checkout main
   git pull
   git checkout -b challenge-7-search-filters
   ```
4. **Open a draft PR early**, even after your first commit. Mentors can help sooner.
5. **Fill in the PR template**: what changed, how to test, a screenshot for UI changes.
6. **CI must pass.** GitHub runs lint, typecheck, tests and a build on every PR.
   Run them yourself first:
   ```bash
   npm run lint
   npm run typecheck
   npm test
   npm run build
   ```
7. **A mentor reviews.** They explain the *why* behind any changes they ask for.
   Push more commits to the same branch to respond.
8. **Squash and merge.** Your PR also flips your row on the board to `Done`.

## Ground rules

- **Never commit secrets.** Keys live in `.env.local` (git-ignored) and in Vercel.
  If you accidentally commit one, tell a mentor right away; don't just delete it.
- **Keep PRs small.** One challenge per PR. Small PRs get reviewed faster.
- **Write for the next student.** Plain names, small files, and a comment wherever
  something isn't obvious.
- **Use the theme colors** from `app/theme.css` (`bg-accent`, `text-muted`, ...)
  instead of hard-coded hex values.
- **Use mock AI locally.** Keep `AI_PROVIDER=mock` unless you are working on the AI
  and a mentor gave you a key. The real model has a shared, limited free quota.

## Where things live

| Folder | What's in it |
| --- | --- |
| `app/` | Pages and API routes. A folder = a URL (`app/games/page.tsx` → `/games`) |
| `components/` | Reusable UI pieces (buttons, the header, games) |
| `lib/` | Plain logic: AI calls (`ai.ts`), chunking, rate limiting, Supabase clients |
| `supabase/migrations/` | Database changes, as SQL files applied in order |
| `tests/` | Unit tests (`*.test.ts`), run with `npm test` |
| `scripts/` | One-off scripts mentors run locally (like creating the first admin) |
| `docs/` | Longer explanations: how Ask the Hub works, deploys, etc. |

## Need help?

Comment on your draft PR and tag a mentor, or ask in the group chat.
