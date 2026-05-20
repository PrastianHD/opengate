import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Usage | OpenGates",
};

const MICRO_PER_USD = 1_000_000;

function formatUsd(microCents) {
  if (microCents == null) return "—";
  const usd = microCents / MICRO_PER_USD;
  return usd.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 6,
  });
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const PERIOD_OPTIONS = [
  { key: "24h", label: "24 hours", ms: 24 * 60 * 60 * 1000 },
  { key: "7d", label: "7 days", ms: 7 * 24 * 60 * 60 * 1000 },
  { key: "30d", label: "30 days", ms: 30 * 24 * 60 * 60 * 1000 },
];

export default async function UsagePage({ searchParams }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const params = await searchParams;
  const periodKey = params?.period || "7d";
  const period =
    PERIOD_OPTIONS.find((p) => p.key === periodKey) || PERIOD_OPTIONS[1];
  const since = new Date(Date.now() - period.ms).toISOString();

  const { data: rows } = await supabase
    .from("usage_log")
    .select(
      "id, endpoint, input_tokens, output_tokens, total_tokens, cost_micro_cents, duration_ms, status_code, is_stream, ttft_ms, error, created_at, model_id, models(slug, display_name)"
    )
    .eq("user_id", user.id)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(100);

  const totalRequests = rows?.length || 0;
  const totalCost =
    rows?.reduce((sum, r) => sum + (r.cost_micro_cents || 0), 0) || 0;
  const totalTokens =
    rows?.reduce((sum, r) => sum + (r.total_tokens || 0), 0) || 0;
  const errorCount = rows?.filter((r) => r.status_code >= 400).length || 0;

  return (
    <div className="dashboard-page">
      <header className="dashboard-page-head dashboard-page-head-row">
        <div>
          <h1>Usage</h1>
          <p className="dashboard-page-sub">
            Recent requests routed through your account.
          </p>
        </div>
        <div className="dashboard-period">
          {PERIOD_OPTIONS.map((p) => (
            <a
              key={p.key}
              href={`/dashboard/usage?period=${p.key}`}
              className={p.key === period.key ? "is-active" : ""}
            >
              {p.label}
            </a>
          ))}
        </div>
      </header>

      <div className="dashboard-grid">
        <article className="dashboard-stat">
          <span className="dashboard-stat-label">Requests</span>
          <span className="dashboard-stat-value">
            {totalRequests.toLocaleString()}
          </span>
        </article>
        <article className="dashboard-stat">
          <span className="dashboard-stat-label">Tokens</span>
          <span className="dashboard-stat-value">
            {totalTokens.toLocaleString()}
          </span>
        </article>
        <article className="dashboard-stat">
          <span className="dashboard-stat-label">Spend</span>
          <span className="dashboard-stat-value">{formatUsd(totalCost)}</span>
        </article>
        <article className="dashboard-stat">
          <span className="dashboard-stat-label">Errors</span>
          <span className="dashboard-stat-value">{errorCount}</span>
          <span className="dashboard-stat-hint">
            HTTP 4xx/5xx in this period.
          </span>
        </article>
      </div>

      {!rows || rows.length === 0 ? (
        <div className="dashboard-empty">
          <h3>No requests in this period</h3>
          <p>
            Once you create a key and send your first request, it will show up
            here within seconds.
          </p>
        </div>
      ) : (
        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Model</th>
                <th>Tokens (in/out)</th>
                <th>Cost</th>
                <th>Latency</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const ok = r.status_code < 400;
                return (
                  <tr key={r.id}>
                    <td className="dashboard-time">{formatDate(r.created_at)}</td>
                    <td>
                      <code>{r.models?.slug || "—"}</code>
                    </td>
                    <td>
                      {r.input_tokens.toLocaleString()} /{" "}
                      {r.output_tokens.toLocaleString()}
                    </td>
                    <td>{formatUsd(r.cost_micro_cents)}</td>
                    <td>
                      {r.duration_ms ? `${r.duration_ms} ms` : "—"}
                      {r.is_stream && r.ttft_ms ? (
                        <span className="dashboard-ttft">
                          ttft {r.ttft_ms}ms
                        </span>
                      ) : null}
                    </td>
                    <td>
                      <span className={`pill pill-${ok ? "active" : "expired"}`}>
                        {r.status_code}
                      </span>
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
