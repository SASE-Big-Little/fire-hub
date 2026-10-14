# Challenge 24: public showcase

**Goal:** let anyone on the internet see what Fire Hub members built, so you can
link to it from your portfolio. Signed-out visitors can open `/games` and a new
`/showcase` page. Everything else (Ask the Hub, the resource library, admin)
stays members-only.

## What to build

1. **A list of public pages in `proxy.ts`.** Right now it only lets signed-out
   visitors see `/sign-in`. Add a small list (for example
   `PUBLIC_PATHS = ["/sign-in", "/games", "/showcase"]`) and allow those, plus
   anything under them (`/games/memory`).
2. **A `/showcase` page** that lists each project: its name, a one-line
   description, the builder's chosen name, a link to their GitHub profile, and a
   link to the PR that added it. Keep the list in a plain file such as
   `app/showcase/projects.ts`, so adding yourself is a one-line PR.
3. **A header for visitors.** `app/layout.tsx` only shows the header when someone
   is signed in. Signed-out visitors on a public page should see a simple header
   with the logo and a "Member sign in" link.

## Rules (a mentor will check these in review)

- **Opt-in only.** People appear on the showcase only if they add themselves in
  their own PR. Never read names from the `profiles` table for public pages.
- **Use the name and GitHub handle the person chooses**, not their Fire Hub username.
- **Public pages must not call Supabase or Ask the Hub.** Games run in the browser;
  keep it that way. That's what keeps the free AI quota and member data safe.
- **Don't make `/api/*` public**, and don't touch the admin or resource pages.

## How to test

- Signed out (use a private window): `/games` and `/showcase` load, while `/`,
  `/resources`, `/ask` and `/admin` still go to the sign-in page, and
  `POST /api/ask` still returns 401.
- Signed in: everything works as before, and `/showcase` shows the normal header.
- Add a unit test for whatever decides if a path is public (for example
  `isPublicPath("/games/memory")` is true and `isPublicPath("/gamesx")` is false).

## You'll learn

How a request guard works, why "default closed" is safer than "default open",
and how to share your work publicly without exposing other people's data.
