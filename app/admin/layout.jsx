import { requireAdminPage } from "@/lib/admin/guard";
import AdminNav from "./AdminNav";

export const metadata = {
  title: "Admin | OpenGates",
};

export default async function AdminLayout({ children }) {
  const { user } = await requireAdminPage();

  return (
    <section className="dashboard-shell">
      <aside className="dashboard-side">
        <div className="dashboard-brand">
          <img src="/logo.svg" alt="OpenGates" />
          <span>
            OpenGates <em className="admin-badge">admin</em>
          </span>
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
      </aside>

      <div className="dashboard-main">{children}</div>
    </section>
  );
}
