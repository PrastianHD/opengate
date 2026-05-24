import Image from "next/image";
import { requireAdminPage } from "@/lib/admin/guard";
import SidebarShell from "../components/SidebarShell";
import AdminNav from "./AdminNav";

export const metadata = {
  title: "Admin | OpenGate",
};

export default async function AdminLayout({ children }) {
  await requireAdminPage();

  return (
    <SidebarShell
      ariaLabel="Admin navigation"
      side={({ collapseButton }) => (
        <>
          <div className="dashboard-brand">
            <Image src="/logo.svg" alt="" width={28} height={28} priority />
            <span>
              OpenGate <em className="admin-badge">admin</em>
            </span>
            {collapseButton}
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
      )}
    >
      {children}
    </SidebarShell>
  );
}
