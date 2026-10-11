// Supabase client for SERVER code (pages, server actions, API routes).
// It acts as the signed-in user (from their cookies), so Row Level Security
// still applies. For admin-only work, use lib/supabase/admin.ts instead.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Pages can't set cookies. That's fine: proxy.ts refreshes the
            // session cookie on every request.
          }
        },
      },
    },
  );
}
