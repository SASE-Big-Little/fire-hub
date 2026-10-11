# The database (Supabase)

Fire Hub uses one free Supabase project, `fire-hub`. It gives us a Postgres
database and sign-in (Supabase Auth).

## Tables

| Table | What it stores | Who can read / write |
| --- | --- | --- |
| `profiles` | One row per member: `username`, `display_name`, `role` (`admin` or `mentee`), `disabled` | Signed-in users read; only admins update |
| `resources` | The library: title, url, summary, content, type, tags, `status` (`pending` / `approved` / `rejected`) | Signed-in users read approved ones (and their own); anyone signed in submits as `pending`; only admins approve |
| `chunks` | Small pieces of approved resources, with a full-text search column | Server only |
| `ai_usage` | One row per Ask the Hub question (for the 10-per-hour limit) | Server only |
| `login_attempts` | Failed sign-ins (to slow down password guessing) | Server only |

"Server only" means Row Level Security (RLS) is on and there are no policies,
so the only way in is the server's service role key.

## Changing the database

Never change tables by clicking around in the dashboard. Every change is a
**migration**: a new SQL file in `supabase/migrations/`, named
`<timestamp>_<what_it_does>.sql`. Migrations run in order, so anyone can
rebuild the same database from scratch.

1. Add a new file, e.g. `supabase/migrations/20261101120000_add_resource_likes.sql`.
2. Put RLS on any new table, with policies for who can read and write.
3. A mentor applies it to the real project and regenerates the types:
   ```bash
   npx supabase gen types typescript --project-id zzrohkcygyrbdjpvseit > lib/supabase/types.ts
   ```
   (Needs `npx supabase login` first.)

## Auth settings (set once in the dashboard)

In **Authentication → Sign In / Providers**:

- **Allow new users to sign up**: OFF. Admins create every account.
- **Email provider → Confirm email**: OFF. Accounts use placeholder emails that never receive mail.
- **Minimum password length**: 8.
