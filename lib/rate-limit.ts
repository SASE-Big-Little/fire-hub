// Rate limits: "at most N things per time window".
//
// Used for:
//  - Ask the Hub: 10 questions per hour per person (table: ai_usage)
//  - Sign-in: 5 failed attempts per 15 minutes per username (table: login_attempts)
//
// The math lives in checkRateLimit(), a plain function that's easy to test.
// The other functions just read and write the database.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase/types";

type Db = SupabaseClient<Database>;

export const ASK_LIMIT = { max: 10, windowMinutes: 60 };
export const LOGIN_LIMIT = { max: 5, windowMinutes: 15 };

export type RateLimitResult = {
  allowed: boolean;
  /** How many more are allowed right now. */
  remaining: number;
  /** When blocked: minutes until the next one is allowed. 0 when allowed. */
  retryAfterMinutes: number;
};

/**
 * Decides whether one more event is allowed.
 * @param eventTimes when earlier events happened (any order)
 */
export function checkRateLimit(
  eventTimes: Date[],
  limit: { max: number; windowMinutes: number },
  now: Date = new Date(),
): RateLimitResult {
  const windowMs = limit.windowMinutes * 60_000;
  const windowStart = now.getTime() - windowMs;

  // Only events inside the window count.
  const recent = eventTimes
    .map((t) => t.getTime())
    .filter((t) => t > windowStart)
    .sort((a, b) => a - b);

  if (recent.length < limit.max) {
    return { allowed: true, remaining: limit.max - recent.length, retryAfterMinutes: 0 };
  }

  // Blocked until enough old events slide out of the window.
  // With exactly `max` events, that's when the oldest one expires.
  const unblockAt = recent[recent.length - limit.max] + windowMs;
  const retryAfterMinutes = Math.max(1, Math.ceil((unblockAt - now.getTime()) / 60_000));
  return { allowed: false, remaining: 0, retryAfterMinutes };
}

function windowStartIso(windowMinutes: number, now: Date): string {
  return new Date(now.getTime() - windowMinutes * 60_000).toISOString();
}

// --- Ask the Hub -----------------------------------------------------------

export async function checkAskLimit(db: Db, userId: string, now = new Date()) {
  const { data, error } = await db
    .from("ai_usage")
    .select("asked_at")
    .eq("user_id", userId)
    .gte("asked_at", windowStartIso(ASK_LIMIT.windowMinutes, now));
  if (error) throw new Error(`Could not check question limit: ${error.message}`);

  return checkRateLimit(data.map((row) => new Date(row.asked_at)), ASK_LIMIT, now);
}

export async function recordQuestion(db: Db, userId: string) {
  const { error } = await db.from("ai_usage").insert({ user_id: userId });
  if (error) throw new Error(`Could not record question: ${error.message}`);
}

// --- Sign-in ---------------------------------------------------------------

export async function checkLoginLimit(db: Db, username: string, now = new Date()) {
  const { data, error } = await db
    .from("login_attempts")
    .select("attempted_at")
    .eq("username", username)
    .gte("attempted_at", windowStartIso(LOGIN_LIMIT.windowMinutes, now));
  if (error) throw new Error(`Could not check sign-in attempts: ${error.message}`);

  return checkRateLimit(data.map((row) => new Date(row.attempted_at)), LOGIN_LIMIT, now);
}

export async function recordFailedLogin(db: Db, username: string) {
  await db.from("login_attempts").insert({ username });
}

export async function clearFailedLogins(db: Db, username: string) {
  await db.from("login_attempts").delete().eq("username", username);
}
