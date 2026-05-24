import { createServerClient } from "@supabase/ssr";
import { createClient as createServerlessClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Server-side Supabase client (RSC, route handlers, server actions).
// Reads/writes auth cookies via Next.js cookies() store.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — Next.js disallows mutation here.
            // Middleware refreshes the session, so this branch is harmless.
          }
        },
      },
    }
  );
}

// Service-role client (bypasses RLS). Use only in trusted server code:
// - gateway request handler debiting credit
// - admin actions
// Never import from a client component.
export function createServiceClient() {
  return createServerlessClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}
