import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// Refresh the Supabase auth cookie on every request so server components
// always see a valid session. Without this, expired access tokens would
// surface as "logged out" even when the refresh token is still valid.
export async function middleware(request) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Touching getUser() forces a refresh if needed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /dashboard and /admin
  const path = request.nextUrl.pathname;
  if ((path.startsWith("/dashboard") || path.startsWith("/admin")) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Run on everything except static assets, images, Next internals, and
    // the public gateway API (which handles its own auth via Bearer tokens).
    "/((?!_next/static|_next/image|favicon.ico|logo.svg|api/v1|v1|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
