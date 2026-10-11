"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkLoginLimit, clearFailedLogins, recordFailedLogin } from "@/lib/rate-limit";
import { normalizeUsername, usernameToEmail } from "@/lib/usernames";

export type SignInState = { error: string | null };

// The same message for "no such user" and "wrong password", so nobody can
// use the sign-in form to discover which usernames exist.
const WRONG_DETAILS = "Wrong username or password.";

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const username = normalizeUsername(String(formData.get("username") ?? ""));
  const password = String(formData.get("password") ?? "");
  if (!username || !password) {
    return { error: "Enter your username and password." };
  }

  // Slow down password guessing: 5 failures locks that username for a while.
  const admin = createAdminClient();
  const limit = await checkLoginLimit(admin, username);
  if (!limit.allowed) {
    return {
      error: `Too many tries. Wait ${limit.retryAfterMinutes} minute(s), or ask a mentor to reset your password.`,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(username),
    password,
  });

  if (error || !data.user) {
    await recordFailedLogin(admin, username);
    return { error: WRONG_DETAILS };
  }

  // Disabled accounts can't sign in, even with the right password.
  const { data: profile } = await supabase
    .from("profiles")
    .select("disabled")
    .eq("id", data.user.id)
    .single();
  if (!profile || profile.disabled) {
    await supabase.auth.signOut();
    return { error: "This account is disabled. Ask a mentor if that's a mistake." };
  }

  await clearFailedLogins(admin, username);
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
