// proxy.ts runs before every page and API request.
// (Next.js 16 renamed "middleware" to "proxy". Same idea: a guard at the door.)
//
// It does two things:
//  1. Keeps the Supabase sign-in cookie fresh.
//  2. Sends signed-out visitors to /sign-in. Signed-out visitors never see
//     any other page.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SIGN_IN_PATH = "/sign-in";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  // Checks the session and refreshes it if needed.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);
  const path = request.nextUrl.pathname;

  if (!signedIn && path !== SIGN_IN_PATH) {
    if (path.startsWith("/api/")) {
      return NextResponse.json({ error: "Please sign in." }, { status: 401 });
    }
    return NextResponse.redirect(new URL(SIGN_IN_PATH, request.url));
  }

  if (signedIn && path === SIGN_IN_PATH) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  // Run on everything except Next.js internals and static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
