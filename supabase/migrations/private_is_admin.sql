-- Move is_admin() out of the "public" schema.
--
-- Everything in "public" can be called through Supabase's web API.
-- is_admin() is only needed inside our RLS policies, so it lives in a
-- "private" schema that the API doesn't expose. Policies keep working
-- because Postgres tracks the function itself, not its name.

create schema if not exists private;

alter function public.is_admin() set schema private;

revoke all on schema private from public;
grant usage on schema private to authenticated;

revoke execute on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;
