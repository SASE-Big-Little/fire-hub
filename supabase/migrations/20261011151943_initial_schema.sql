-- Fire Hub: initial schema
--
-- Tables:   profiles, resources, chunks, ai_usage, login_attempts
-- Security: Row Level Security (RLS) is ON for every table. With RLS on,
--           nobody can read or write a row unless a policy below allows it.
--           The server's service role key skips RLS, which is why it must
--           never reach the browser.

-- ---------------------------------------------------------------------------
-- profiles: one row per person, linked to their Supabase auth user
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  -- Lowercase letters, numbers, dots, dashes and underscores; 3 to 30 characters.
  username text not null unique check (username ~ '^[a-z0-9._-]{3,30}$'),
  display_name text not null check (char_length(display_name) between 1 and 60),
  role text not null default 'mentee' check (role in ('admin', 'mentee')),
  disabled boolean not null default false,
  created_at timestamptz not null default now()
);

-- Is the signed-in user an admin? Used inside the policies below.
-- "security definer" lets it read profiles even though RLS is on.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and not disabled
  );
$$;

alter table public.profiles enable row level security;

-- Signed-in members can see each other's names (e.g. "submitted by Maya").
create policy "Signed-in users can read profiles"
  on public.profiles for select
  to authenticated
  using (true);

-- Only admins change roles or disable people. Creating and deleting
-- accounts happens on the server with the service role key.
create policy "Admins can update profiles"
  on public.profiles for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- resources: the shared library
-- ---------------------------------------------------------------------------
create table public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 200),
  url text check (url is null or url ~ '^https?://'),
  summary text not null check (char_length(summary) between 10 and 1000),
  -- The text Ask the Hub reads: key points, notes, or pasted article text.
  content text not null default '' check (char_length(content) <= 50000),
  type text not null default 'article'
    check (type in ('article', 'video', 'book', 'course', 'tool', 'other')),
  tags text[] not null default '{}',
  submitted_by uuid references public.profiles (id) on delete set null
    default auth.uid(),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  last_reviewed_at timestamptz
);

create index resources_status_idx on public.resources (status, created_at desc);
create index resources_submitted_by_idx on public.resources (submitted_by);

alter table public.resources enable row level security;

-- Everyone signed in sees approved resources. You also see your own
-- submissions, and admins see everything (for the approval queue).
create policy "Read approved, own, or all if admin"
  on public.resources for select
  to authenticated
  using (
    status = 'approved'
    or submitted_by = (select auth.uid())
    or (select public.is_admin())
  );

-- Anyone signed in can submit, but only as themselves and only as pending.
create policy "Submit own resources as pending"
  on public.resources for insert
  to authenticated
  with check (
    submitted_by = (select auth.uid())
    and status = 'pending'
    and last_reviewed_at is null
  );

-- Only admins approve, reject, edit or delete.
create policy "Admins can update resources"
  on public.resources for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can delete resources"
  on public.resources for delete
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- chunks: small pieces of approved resources, searched by Ask the Hub
-- Written and read by the server only (no policies = no access for users).
-- ---------------------------------------------------------------------------
create table public.chunks (
  id bigint generated always as identity primary key,
  resource_id uuid not null references public.resources (id) on delete cascade,
  chunk_index int not null,
  content text not null,
  -- Postgres keeps this search column up to date automatically.
  search_text tsvector generated always as (to_tsvector('english', content)) stored,
  unique (resource_id, chunk_index)
);

create index chunks_search_text_idx on public.chunks using gin (search_text);

alter table public.chunks enable row level security;
revoke all on public.chunks from anon, authenticated;

-- ---------------------------------------------------------------------------
-- ai_usage: one row per question asked, for the 10-per-hour limit
-- Server only.
-- ---------------------------------------------------------------------------
create table public.ai_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  asked_at timestamptz not null default now()
);

create index ai_usage_user_time_idx on public.ai_usage (user_id, asked_at desc);

alter table public.ai_usage enable row level security;
revoke all on public.ai_usage from anon, authenticated;

-- ---------------------------------------------------------------------------
-- login_attempts: failed sign-ins, so we can slow down password guessing
-- Server only.
-- ---------------------------------------------------------------------------
create table public.login_attempts (
  id bigint generated always as identity primary key,
  username text not null,
  attempted_at timestamptz not null default now()
);

create index login_attempts_username_time_idx
  on public.login_attempts (username, attempted_at desc);

alter table public.login_attempts enable row level security;
revoke all on public.login_attempts from anon, authenticated;

-- ---------------------------------------------------------------------------
-- search_chunks: full-text search over chunks of APPROVED resources
-- Matches ANY of the question's words, best matches first.
-- Only the server (service role) may call it.
-- ---------------------------------------------------------------------------
create function public.search_chunks(query text, match_count int default 5)
returns table (
  chunk_id bigint,
  resource_id uuid,
  resource_title text,
  resource_url text,
  content text,
  rank real
)
language sql
stable
set search_path = ''
as $$
  with q as (
    -- plainto_tsquery joins words with AND (&). Swap to OR (|) so a
    -- question matches if any of its important words appear.
    select nullif(
      replace(plainto_tsquery('english', query)::text, '&', '|'),
      ''
    ) as text_query
  )
  select
    c.id,
    r.id,
    r.title,
    r.url,
    c.content,
    ts_rank_cd(c.search_text, to_tsquery('english', q.text_query)) as rank
  from q
  join public.chunks c on c.search_text @@ to_tsquery('english', q.text_query)
  join public.resources r on r.id = c.resource_id
  where q.text_query is not null
    and r.status = 'approved'
  order by rank desc
  limit least(greatest(match_count, 1), 10);
$$;

revoke execute on function public.search_chunks(text, int) from public, anon, authenticated;
grant execute on function public.search_chunks(text, int) to service_role;
