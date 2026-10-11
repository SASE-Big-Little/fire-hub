// Who is signed in? Helpers for pages and API routes.
import "server-only";
import { NextResponse } from "next/server";
import { createClient } from "./supabase/server";
import type { Tables } from "./supabase/types";

export type Profile = Tables<"profiles">;

/**
 * The signed-in member's profile, or null if nobody is signed in
 * (or their account is disabled).
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  // getUser() asks Supabase to confirm the session is real.
  // Never trust the cookie alone for security decisions.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.disabled) return null;
  return profile;
}

/**
 * For API routes. Returns the profile if the caller is a signed-in member,
 * otherwise a ready-made error response to return.
 */
export async function requireMember(): Promise<
  { profile: Profile; response?: never } | { profile?: never; response: NextResponse }
> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return { response: NextResponse.json({ error: "Please sign in." }, { status: 401 }) };
  }
  return { profile };
}

/** Like requireMember(), but the caller must also be an admin. */
export async function requireAdmin(): Promise<
  { profile: Profile; response?: never } | { profile?: never; response: NextResponse }
> {
  const result = await requireMember();
  if (result.response) return result;
  if (result.profile.role !== "admin") {
    return { response: NextResponse.json({ error: "Admins only." }, { status: 403 }) };
  }
  return result;
}
