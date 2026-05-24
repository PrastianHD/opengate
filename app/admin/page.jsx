import { requireAdminPage } from "@/lib/admin/guard";
import { formatUsd } from "@/lib/format";
import EmptyState from "@/app/components/EmptyState";
import Pill from "@/app/components/Pill";
import {
  BarList,
  DeltaIndicator,
  Sparkline,
  bucketByTime,
  bucketSumByTime,
} from "@/app/components/Charts";

export const metadata = {
  title: "Admin Overview | OpenGate",
};

export default async function AdminOverview() {
  const { sbService } = await requireAdminPage();
  const now = Date.now();
  const since24h = new Date(now - 24 * 60 * 60 * 1000).toISOString();
  const since48h = new Date(now - 48 * 60 * 60 * 1000).toISOString();
  const since7d = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  const since14d = new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString();

  // Run in parallel — admin uses service role, no RLS.
  const [
    { count: userCount },
    { count: keysCount },
    { data: balanceAgg },
    { data: usage24h },
    { data: usagePrev24h },
    { data: usage7d },
    { data: usagePrev7d },
    { data: keysHealth },
    { data: topModels },
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
      .select("cost_micro_cents, status_code, total_tokens, is_stream, created_at")
      .gte("created_at", since24h),
    sbService
      .from("usage_log")
      .select("cost_micro_cents, status_code")
      .gte("created_at", since48h)
      .lt("created_at", since24h),
    sbService
      .from("usage_log")
      .select("cost_micro_cents, status_code, created_at")
      .gte("created_at", since7d),
    sbService
      .from("usage_log")
      .select("cost_micro_cents")
      .gte("created_at", since14d)
      .lt("created_at", since7d),
    sbService
      .from("upstream_keys")
      .select("id, label, enabled, cooldown_until, providers(slug, name)"),
    sbService
      .from("usage_log")
      .select("cost_micro_cents, models(slug)")
      .gte("created_at", since7d),
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

  const requestsPrev24h = usagePrev24h?.length || 0;
  const revenuePrev24h =
    usagePrev24h?.reduce((s, r) => s + (r.cost_micro_cents || 0), 0) || 0;
  const revenuePrev7d =
    usagePrev7d?.reduce((s, r) => s + (r.cost_micro_cents || 0), 0) || 0;

  const keysOnCooldown =
    keysHealth?.filter(
      (k) => k.cooldown_until && new Date(k.cooldown_until) > new Date()
    ) || [];
  const keysDisabled = keysHealth?.filter((k) => !k.enabled) || [];

  const start24h = now - 24 * 60 * 60 * 1000;
  const start7d = now - 7 * 24 * 60 * 60 * 1000;
  const requestsTrend24h = bucketByTime(
    usage24h || [],
    (r) => r.created_at,
    24,
    start24h,
    now
  );
  const revenueTrend7d = bucketSumByTime(
    usage7d || [],
    (r) => r.created_at,
    (r) => r.cost_micro_cents || 0,
    14,
    start7d,
    now
  );

  const modelRevenue = (() => {
    const byModel = new Map();
    for (const r of topModels || []) {
      const slug = r.models?.slug || "—";
      const cur = byModel.get(slug) || 0;
      byModel.set(slug, cur + (r.cost_micro_cents || 0));
    }
    return Array.from(byModel.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  })();

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
          <DeltaIndicator value={revenue24h} prior={revenuePrev24h} />
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
          <DeltaIndicator value={requests24h} prior={requestsPrev24h} />
          {requests24h > 0 && (
            <Sparkline
              values={requestsTrend24h}
              ariaLabel="Request trend last 24h"
            />
          )}
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
          <DeltaIndicator value={revenue7d} prior={revenuePrev7d} />
          {revenue7d > 0 && (
            <Sparkline
              values={revenueTrend7d}
              stroke="var(--success)"
              fill="rgba(90, 138, 58, 0.10)"
              ariaLabel="Revenue trend last 7 days"
            />
          )}
        </article>
      </div>

      {modelRevenue.length > 0 && (
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">Revenue by model · 7d</h2>
          <div className="dashboard-card">
            <BarList
              data={modelRevenue}
              formatValue={(v) => formatUsd(v, 4)}
              ariaLabel="Revenue per model last 7 days"
            />
          </div>
        </section>
      )}

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">Upstream key health</h2>
        {keysOnCooldown.length === 0 && keysDisabled.length === 0 ? (
          <EmptyState
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </svg>
            }
            title="All clear"
            description="No upstream keys are on cooldown or disabled."
          />
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
                      <Pill status={!k.enabled ? "disabled" : "cooldown"} />
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
