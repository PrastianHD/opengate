import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardNav from "./DashboardNav";

export default async function DashboardLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard");

  // Read app-level user row (balance, role) — RLS lets the user see their own row.
  const { data: appUser } = await supabase
    .from("users")
    .select("email, display_name, avatar_url, role, balance_micro_cents")
    .eq("id", user.id)
    .single();

  return (
    <section className="dashboard-shell">
      <aside className="dashboard-side">
        <div className="dashboard-brand">
          <img src="/logo.svg" alt="OpenGate" />
          <span>OpenGate</span>
        </div>

        <DashboardNav />

        <div className="dashboard-side-foot">
          <div className="dashboard-userchip">
            {appUser?.avatar_url ? (
              <img src={appUser.avatar_url} alt="" />
            ) : (
              <div className="dashboard-avatar-fallback">
                {(appUser?.email || "?").slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <strong>{appUser?.display_name || appUser?.email}</strong>
              <span>{appUser?.role}</span>
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <button type="submit" className="dashboard-signout">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="dashboard-main">{children}</div>
    </section>
  );
}
