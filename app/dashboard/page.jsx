import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Dashboard | OpenGates",
};

const MICRO_PER_USD = 1_000_000;

function formatUsd(microCents) {
  const usd = (microCents || 0) / MICRO_PER_USD;
  return usd.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
}

export default async function DashboardOverview() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: appUser } = await supabase
    .from("users")
    .select("email, display_name, balance_micro_cents, rpm_cap, role, created_at")
    .eq("id", user.id)
    .single();

  return (
    <div className="dashboard-page">
      <header className="dashboard-page-head">
        <h1>Overview</h1>
        <p className="dashboard-page-sub">
          Welcome back, {appUser?.display_name || appUser?.email}.
        </p>
      </header>

      <div className="dashboard-grid">
        <article className="dashboard-stat">
          <span className="dashboard-stat-label">Credit balance</span>
          <span className="dashboard-stat-value">
            {formatUsd(appUser?.balance_micro_cents)}
          </span>
          <a className="dashboard-stat-cta" href="/dashboard/billing">
            Top up →
          </a>
        </article>

        <article className="dashboard-stat">
          <span className="dashboard-stat-label">Account role</span>
          <span className="dashboard-stat-value capitalize">
            {appUser?.role || "user"}
          </span>
          <span className="dashboard-stat-hint">
            Member since {new Date(appUser?.created_at).toLocaleDateString()}
          </span>
        </article>

        <article className="dashboard-stat">
          <span className="dashboard-stat-label">RPM cap</span>
          <span className="dashboard-stat-value">
            {appUser?.rpm_cap || 200} req/min
          </span>
          <span className="dashboard-stat-hint">
            Safety limit, not a billing quota.
          </span>
        </article>
      </div>

      <section className="dashboard-quickstart">
        <h2>Quick start</h2>
        <ol>
          <li>
            Create an API key under <a href="/dashboard/keys">API Keys</a>.
          </li>
          <li>
            Top up credit on the <a href="/dashboard/billing">Billing</a> page.
          </li>
          <li>
            Point your client at <code>https://api.opengates.cloud/v1</code> using
            your <code>ogt-…</code> token.
          </li>
        </ol>
      </section>
    </div>
  );
}
