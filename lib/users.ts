// Creating member accounts. Used by the admin API and by
// scripts/create-admin.ts, so it takes the admin client as an argument.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/types";
import { checkPassword } from "./passwords";
import { isValidUsername, normalizeUsername, usernameToEmail } from "./usernames";

export type Role = "admin" | "mentee";
export const ROLES: Role[] = ["admin", "mentee"];

export type NewMember = {
  username: string;
  displayName: string;
  role: Role;
  password: string;
};

/** Returns an error message, or null if everything looks right. */
export function checkNewMember(member: NewMember): string | null {
  if (!isValidUsername(normalizeUsername(member.username))) {
    return "Username must be 3 to 30 characters: letters, numbers, dots, dashes or underscores.";
  }
  const name = member.displayName.trim();
  if (name.length < 1 || name.length > 60) {
    return "Display name must be 1 to 60 characters.";
  }
  if (!ROLES.includes(member.role)) {
    return "Role must be admin or mentee.";
  }
  return checkPassword(member.password);
}

/**
 * Creates the sign-in account and the profile row together.
 * If the profile can't be saved, the account is removed again so we never
 * end up with half a user.
 */
export async function createMember(
  admin: SupabaseClient<Database>,
  member: NewMember,
): Promise<{ id: string } | { error: string }> {
  const problem = checkNewMember(member);
  if (problem) return { error: problem };

  const username = normalizeUsername(member.username);

  const { data, error } = await admin.auth.admin.createUser({
    email: usernameToEmail(username),
    password: member.password,
    email_confirm: true, // no confirmation email: the address isn't real
    user_metadata: { username },
  });
  if (error || !data.user) {
    const taken = error?.message.toLowerCase().includes("already");
    return { error: taken ? "That username is already taken." : `Could not create account: ${error?.message}` };
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: data.user.id,
    username,
    display_name: member.displayName.trim(),
    role: member.role,
  });
  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id);
    return { error: `Could not save profile: ${profileError.message}` };
  }

  return { id: data.user.id };
}
