// Supabase client for code that runs in the BROWSER ("use client" components).
// It only has the public anon key, so Row Level Security decides what it can do.
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
