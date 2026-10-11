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

export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Only mentors need it (admin page, Ask the Hub).",
    );
  }

  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
