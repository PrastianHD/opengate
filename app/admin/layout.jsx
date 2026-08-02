import Image from "next/image";
import { requireAdminPage } from "@/lib/admin/guard";
import SidebarShell, { SidebarCollapseButton } from "../components/SidebarShell";
import AdminNav from "./AdminNav";

export const metadata = {
  title: "Admin | OpenGate",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }) {
  await requireAdminPage();

  return (
    <SidebarShell
      ariaLabel="Admin navigation"
      side={
        <>
          <div className="dashboard-brand">
            <Image src="/logo.svg" alt="" width={28} height={28} priority />
            <span>
              OpenGate <em className="admin-badge">admin</em>
            </span>
            <SidebarCollapseButton />
          </div>

          <AdminNav />

          <div className="dashboard-side-foot">
            <a href="/dashboard" className="dashboard-signout">
              ← User dashboard
            </a>
            <form action="/auth/signout" method="post">
              <button type="submit" className="dashboard-signout">
                Sign out
              </button>
            </form>
          </div>
        </>
      }
    >
      {children}
    </SidebarShell>
  );
}
