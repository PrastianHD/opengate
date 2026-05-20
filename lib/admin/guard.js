// Admin guard for server components and route handlers.
// Returns { sb, user, sbService } for admins. For non-admins:
//   - Server components: throw notFound() (treat /admin as if it doesn't exist)
//   - Route handlers: caller checks isAdminGuard(...) result and returns 403
//
// We intentionally use the auth-cookie client to identify the caller, then
// use the SERVICE-role client for the actual writes (admin actions bypass RLS).

import { notFound } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function requireAdminPage() {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) notFound();

  const { data: appUser, error } = await sb
    .from("users")
    .select("id, role, email, display_name")
    .eq("id", user.id)
    .single();

  if (error || appUser?.role !== "admin") notFound();

  return { sb, user: appUser, sbService: createServiceClient() };
}

// Use in route handlers — returns the same shape but { error } object instead
// of throwing.
export async function requireAdminApi() {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return { error: jsonError(401, "unauthenticated", "Sign in required") };
  }
  const { data: appUser } = await sb
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .single();
  if (appUser?.role !== "admin") {
    return { error: jsonError(403, "forbidden", "Admin access required") };
  }
  return {
    user: appUser,
    sb,
    sbService: createServiceClient(),
  };
}

function jsonError(status, code, message) {
  return Response.json({ error: { code, message } }, { status });
}
