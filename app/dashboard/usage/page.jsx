import { createClient } from "@/lib/supabase/server";
import { formatDate, formatUsd } from "@/lib/format";
import Pill from "@/app/components/Pill";
import EmptyState from "@/app/components/EmptyState";
import {
  ActivityHeatmap,
  BarList,
  LatencyHistogram,
  Sparkline,
  bucketByDay,
  bucketByTime,
} from "@/app/components/Charts";

export const metadata = {
  title: "Usage | OpenGate",
};

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

  const startMs = Date.now() - period.ms;
  const endMs = Date.now();
  const trendBuckets = periodKey === "24h" ? 24 : periodKey === "7d" ? 14 : 30;
  const requestTrend = bucketByTime(rows || [], (r) => r.created_at, trendBuckets, startMs, endMs);

  const modelBreakdown = (() => {
    const byModel = new Map();
    for (const r of rows || []) {
      const slug = r.models?.slug || "—";
      const cur = byModel.get(slug) || { value: 0, tokens: 0 };
      cur.value += 1;
      cur.tokens += r.total_tokens || 0;
      byModel.set(slug, cur);
    }
    return Array.from(byModel.entries())
      .map(([label, v]) => ({ label, value: v.value, hint: `${v.tokens.toLocaleString()} tokens` }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  })();

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
          {totalRequests > 0 && (
            <Sparkline
              values={requestTrend}
              ariaLabel={`Request trend for ${period.label}`}
            />
          )}
        </article>
        <article className="dashboard-stat">
          <span className="dashboard-stat-label">Tokens</span>
          <span className="dashboard-stat-value">
            {totalTokens.toLocaleString()}
          </span>
          <span className="dashboard-stat-hint">
            Combined input + output across this period.
          </span>
        </article>
        <article className="dashboard-stat">
          <span className="dashboard-stat-label">Spend</span>
          <span className="dashboard-stat-value">{formatUsd(totalCost)}</span>
          <span className="dashboard-stat-hint">
            Real-time deduction.
          </span>
        </article>
        <article className="dashboard-stat">
          <span className="dashboard-stat-label">Errors</span>
          <span className="dashboard-stat-value">{errorCount}</span>
          <span className="dashboard-stat-hint">
            HTTP 4xx/5xx in this period.
          </span>
        </article>
      </div>

      {modelBreakdown.length > 0 && (
        <section className="dashboard-section">
          <h2 className="dashboard-section-title">Top models</h2>
          <div className="dashboard-card">
            <BarList
              data={modelBreakdown}
              formatValue={(v) => `${v.toLocaleString()} req`}
              ariaLabel="Requests per model"
            />
          </div>
        </section>
      )}

      {(rows?.length || 0) > 0 && (
        <div className="dashboard-grid dashboard-grid-2">
          <section className="dashboard-card">
            <h2 className="dashboard-section-title">Latency distribution</h2>
            <LatencyHistogram
              values={(rows || [])
                .map((r) => r.duration_ms)
                .filter((v) => Number.isFinite(v) && v > 0)}
              ariaLabel="Request latency histogram"
            />
          </section>
          <section className="dashboard-card">
            <h2 className="dashboard-section-title">Activity · 28 days</h2>
            <ActivityHeatmap
              data={bucketByDay(rows || [], (r) => r.created_at)}
              days={28}
              ariaLabel="Daily request activity"
            />
            <p className="text-dim heatmap-hint">
              Each cell = one day. Darker = more requests.
            </p>
          </section>
        </div>
      )}

      {!rows || rows.length === 0 ? (
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="M7 14l4-4 4 4 5-5" />
            </svg>
          }
          title="No requests in this period"
          description="Once you create a key and send your first request, it will show up here within seconds."
          primaryAction={{ label: "Create an API key", href: "/dashboard/keys" }}
          secondaryAction={{ label: "See example request", href: "/docs" }}
        />
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
                      <Pill
                        status={ok ? "active" : "expired"}
                        label={String(r.status_code)}
                      />
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
