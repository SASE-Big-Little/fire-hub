// Members sign in with a short username, but Supabase Auth signs people in
// by email. So every username gets a made-up email address behind the scenes.
// These addresses never receive mail and users never see them.
// (".invalid" is a domain reserved so it can never be a real address.)
const PLACEHOLDER_EMAIL_DOMAIN = "users.fire-hub.invalid";

// 3 to 30 characters: lowercase letters, numbers, dots, dashes, underscores.
// The database checks the same rule (see supabase/migrations).
const USERNAME_PATTERN = /^[a-z0-9._-]{3,30}$/;

/** Trims spaces and lowercases, so "  Maya " and "maya" are the same person. */
export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidUsername(username: string): boolean {
  return USERNAME_PATTERN.test(username);
}

export function usernameToEmail(username: string): string {
  return `${normalizeUsername(username)}@${PLACEHOLDER_EMAIL_DOMAIN}`;
}
