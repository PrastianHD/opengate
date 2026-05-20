import { requireAdminPage } from "@/lib/admin/guard";
import UserActions from "./UserActions";

export const metadata = {
  title: "Users | OpenGate Admin",
};

const MICRO_PER_USD = 1_000_000;

function formatUsd(microCents, fractionDigits = 2) {
  const usd = (microCents || 0) / MICRO_PER_USD;
  return usd.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: 2,
  });
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function AdminUsersPage({ searchParams }) {
  const { sbService } = await requireAdminPage();
  const params = await searchParams;
  const q = (params?.q || "").trim();

  let query = sbService
    .from("users")
    .select(
      "id, email, display_name, role, balance_micro_cents, rpm_cap, banned_at, ban_reason, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (q) {
    query = query.ilike("email", `%${q}%`);
  }

  const { data: users } = await query;

  return (
    <div className="dashboard-page">
      <header className="dashboard-page-head dashboard-page-head-row">
        <div>
          <h1>Users</h1>
          <p className="dashboard-page-sub">
            Manage accounts, balances, and roles. All edits are audited.
          </p>
        </div>
        <form className="user-search" method="get" action="/admin/users">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search by email…"
          />
          {q ? (
            <a href="/admin/users" className="btn-ghost">
              Clear
            </a>
          ) : null}
        </form>
      </header>

      {!users || users.length === 0 ? (
        <div className="dashboard-empty">
          <h3>No users found</h3>
          <p>
            {q
              ? `No accounts match "${q}".`
              : "Once people sign in with Google, they'll appear here."}
          </p>
        </div>
      ) : (
        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Balance</th>
                <th>RPM cap</th>
                <th>Status</th>
                <th>Joined</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const banned = !!u.banned_at;
                return (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.display_name || u.email}</strong>
                      <div className="text-dim user-email">{u.email}</div>
                    </td>
                    <td>
                      <span
                        className={`pill pill-${
                          u.role === "admin"
                            ? "active"
                            : u.role === "reseller"
                            ? "debit"
                            : "disabled"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>{formatUsd(u.balance_micro_cents, 4)}</td>
                    <td>{u.rpm_cap || "default"}</td>
                    <td>
                      {banned ? (
                        <span className="pill pill-revoked" title={u.ban_reason}>
                          banned
                        </span>
                      ) : (
                        <span className="pill pill-active">active</span>
                      )}
                    </td>
                    <td>{formatDate(u.created_at)}</td>
                    <td>
                      <UserActions user={u} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
