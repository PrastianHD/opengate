import { requireAdminPage } from "@/lib/admin/guard";

export const metadata = {
  title: "Admin Overview | OpenGate",
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

export default async function AdminOverview() {
  const { sbService } = await requireAdminPage();
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Run in parallel — admin uses service role, no RLS.
  const [
    { count: userCount },
    { count: keysCount },
    { data: balanceAgg },
    { data: usage24h },
    { data: usage7d },
    { data: keysHealth },
  ] = await Promise.all([
    sbService.from("users").select("*", { count: "exact", head: true }),
    sbService
      .from("gateway_keys")
      .select("*", { count: "exact", head: true })
      .is("revoked_at", null)
      .eq("enabled", true),
    sbService.from("users").select("balance_micro_cents"),
    sbService
      .from("usage_log")
      .select("cost_micro_cents, status_code, total_tokens, is_stream")
      .gte("created_at", since24h),
    sbService
      .from("usage_log")
      .select("cost_micro_cents, status_code")
      .gte("created_at", since7d),
    sbService
      .from("upstream_keys")
      .select("id, label, enabled, cooldown_until, providers(slug, name)"),
  ]);

  const totalBalance =
    balanceAgg?.reduce((s, u) => s + (u.balance_micro_cents || 0), 0) || 0;

  const requests24h = usage24h?.length || 0;
  const errors24h =
    usage24h?.filter((r) => r.status_code >= 400).length || 0;
  const tokens24h =
    usage24h?.reduce((s, r) => s + (r.total_tokens || 0), 0) || 0;
  const revenue24h =
    usage24h?.reduce((s, r) => s + (r.cost_micro_cents || 0), 0) || 0;
  const revenue7d =
    usage7d?.reduce((s, r) => s + (r.cost_micro_cents || 0), 0) || 0;

  const keysOnCooldown =
    keysHealth?.filter(
      (k) => k.cooldown_until && new Date(k.cooldown_until) > new Date()
    ) || [];
  const keysDisabled = keysHealth?.filter((k) => !k.enabled) || [];

  return (
    <div className="dashboard-page">
      <header className="dashboard-page-head">
        <h1>Admin Overview</h1>
        <p className="dashboard-page-sub">
          System-wide metrics and provider health.
        </p>
      </header>

      <div className="dashboard-grid">
        <article className="dashboard-stat">
          <span className="dashboard-stat-label">Users</span>
          <span className="dashboard-stat-value">
            {userCount?.toLocaleString() || 0}
          </span>
          <span className="dashboard-stat-hint">All registered accounts.</span>
        </article>
        <article className="dashboard-stat">
          <span className="dashboard-stat-label">Active keys</span>
          <span className="dashboard-stat-value">
            {keysCount?.toLocaleString() || 0}
          </span>
          <span className="dashboard-stat-hint">Enabled, not revoked.</span>
        </article>
        <article className="dashboard-stat">
          <span className="dashboard-stat-label">Outstanding credit</span>
          <span className="dashboard-stat-value">{formatUsd(totalBalance)}</span>
          <span className="dashboard-stat-hint">Total user balances.</span>
        </article>
        <article className="dashboard-stat">
          <span className="dashboard-stat-label">Revenue 24h</span>
          <span className="dashboard-stat-value">{formatUsd(revenue24h, 4)}</span>
          <span className="dashboard-stat-hint">
            Charged to users in the last 24h.
          </span>
        </article>
      </div>

      <div className="dashboard-grid">
        <article className="dashboard-stat">
          <span className="dashboard-stat-label">Requests 24h</span>
          <span className="dashboard-stat-value">
            {requests24h.toLocaleString()}
          </span>
        </article>
        <article className="dashboard-stat">
          <span className="dashboard-stat-label">Tokens 24h</span>
          <span className="dashboard-stat-value">
            {tokens24h.toLocaleString()}
          </span>
        </article>
        <article className="dashboard-stat">
          <span className="dashboard-stat-label">Errors 24h</span>
          <span className="dashboard-stat-value">{errors24h}</span>
        </article>
        <article className="dashboard-stat">
          <span className="dashboard-stat-label">Revenue 7d</span>
          <span className="dashboard-stat-value">{formatUsd(revenue7d, 4)}</span>
        </article>
      </div>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">Upstream key health</h2>
        {keysOnCooldown.length === 0 && keysDisabled.length === 0 ? (
          <div className="dashboard-empty">
            <h3>All clear</h3>
            <p>No upstream keys are on cooldown or disabled.</p>
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Label</th>
                  <th>State</th>
                  <th>Cooldown until</th>
                </tr>
              </thead>
              <tbody>
                {[...keysDisabled, ...keysOnCooldown].map((k) => (
                  <tr key={k.id}>
                    <td>
                      <strong>{k.providers?.name}</strong>
                    </td>
                    <td>{k.label}</td>
                    <td>
                      <span
                        className={`pill pill-${
                          !k.enabled ? "expired" : "debit"
                        }`}
                      >
                        {!k.enabled ? "disabled" : "cooldown"}
                      </span>
                    </td>
                    <td>
                      {k.cooldown_until
                        ? new Date(k.cooldown_until).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
