import { redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import Avatar from "../components/Avatar";
import SidebarShell from "../components/SidebarShell";
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
    <SidebarShell
      ariaLabel="Dashboard navigation"
      side={({ collapseButton }) => (
        <>
          <div className="dashboard-brand">
            <Image src="/logo.svg" alt="" width={28} height={28} priority />
            <span>OpenGate</span>
            {collapseButton}
          </div>

          <DashboardNav />

          <div className="dashboard-side-foot">
            <div className="dashboard-userchip">
              <Avatar
                src={appUser?.avatar_url}
                name={appUser?.display_name || appUser?.email}
                size={32}
              />
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
        </>
      )}
    >
      {children}
    </SidebarShell>
  );
}
