// Supabase ADMIN client. It uses the service role key, which skips Row Level
// Security and can create or delete users.
//
// Rules for this file:
//  - Only import it from server code. The "server-only" line below makes the
//    build fail if a browser component imports it by mistake.
//  - Only use it AFTER checking the caller is allowed (see lib/auth.ts).
//  - Never log the key or send it to the browser.
import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * True when the service role key is set. Production always has it. Members
 * running the "quick setup" locally don't, so features that need it
 * (Ask the Hub, the admin page, the sign-in attempt limit) can check first.
 */
export function hasServiceRoleKey(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. See \"Full setup\" in the README.",
    );
  }

  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
