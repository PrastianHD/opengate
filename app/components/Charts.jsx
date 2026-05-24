// Pure-SVG chart primitives. No dependencies — keeps bundle small and the
// editorial aesthetic intact. Use for dashboard sparklines and admin bars.

function buildPath(values, w, h, pad = 2) {
  if (values.length === 0) return "";
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = values.length > 1 ? (w - pad * 2) / (values.length - 1) : 0;
  return values
    .map((v, i) => {
      const x = pad + i * step;
      const y = pad + (h - pad * 2) * (1 - (v - min) / range);
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export function Sparkline({
  values,
  width = 120,
  height = 36,
  stroke = "var(--accent)",
  fill = "rgba(193, 39, 45, 0.10)",
  ariaLabel = "Trend sparkline",
}) {
  if (!values || values.length === 0) {
    return null;
  }
  const path = buildPath(values, width, height);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const lastY = height - 2 - (height - 4) * ((values[values.length - 1] - min) / range);
  const lastX = values.length > 1 ? width - 2 : width / 2;
  const areaPath = `${path} L${lastX.toFixed(2)},${height - 2} L${(2).toFixed(2)},${height - 2} Z`;

  return (
    <svg
      className="sparkline"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
    >
      <path d={areaPath} fill={fill} />
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={lastX} cy={lastY} r="2.4" fill={stroke} />
    </svg>
  );
}

export function BarList({
  data,
  formatValue = (v) => v,
  ariaLabel = "Bar chart",
}) {
  // data: [{ label, value, hint? }]
  if (!data || data.length === 0) {
    return <p className="text-dim">No data.</p>;
  }
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className="bar-list" aria-label={ariaLabel}>
      {data.map((d) => {
        const pct = (d.value / max) * 100;
        return (
          <li key={d.label} className="bar-row">
            <div className="bar-row-head">
              <span className="bar-label" title={d.hint}>
                {d.label}
              </span>
              <span className="bar-value num">{formatValue(d.value)}</span>
            </div>
            <div className="bar-track" aria-hidden="true">
              <div className="bar-fill" style={{ width: `${pct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// Bucket timestamped events into N evenly-spaced buckets across [start, end].
// Returns array of counts of length `buckets`.
export function bucketByTime(events, getTime, buckets, startMs, endMs) {
  const span = Math.max(endMs - startMs, 1);
  const counts = new Array(buckets).fill(0);
  for (const e of events) {
    const t = getTime(e);
    if (t == null) continue;
    const ms = typeof t === "string" ? new Date(t).getTime() : t;
    if (ms < startMs || ms > endMs) continue;
    const idx = Math.min(
      buckets - 1,
      Math.floor(((ms - startMs) / span) * buckets)
    );
    counts[idx] += 1;
  }
  return counts;
}

export function bucketSumByTime(events, getTime, getValue, buckets, startMs, endMs) {
  const span = Math.max(endMs - startMs, 1);
  const sums = new Array(buckets).fill(0);
  for (const e of events) {
    const t = getTime(e);
    if (t == null) continue;
    const ms = typeof t === "string" ? new Date(t).getTime() : t;
    if (ms < startMs || ms > endMs) continue;
    const idx = Math.min(
      buckets - 1,
      Math.floor(((ms - startMs) / span) * buckets)
    );
    sums[idx] += Number(getValue(e)) || 0;
  }
  return sums;
}

// DeltaIndicator — renders a percentage change pill ("↑ 12.4%") with sign
// color. Pass `value` and `prior`. Returns null if prior is 0/undefined.
export function DeltaIndicator({ value, prior, format = (v) => `${v.toFixed(1)}%`, neutralAtZero = true }) {
  if (prior == null || prior === 0) {
    if (value === 0 || value == null) return null;
    return <span className="delta-indicator delta-up">new</span>;
  }
  const pct = ((value - prior) / Math.abs(prior)) * 100;
  if (neutralAtZero && Math.abs(pct) < 0.05) {
    return <span className="delta-indicator delta-flat">±0%</span>;
  }
  const arrow = pct > 0 ? "↑" : "↓";
  const cls = pct > 0 ? "delta-up" : "delta-down";
  return (
    <span className={`delta-indicator ${cls}`}>
      {arrow} {format(Math.abs(pct))}
    </span>
  );
}

// LatencyHistogram — bucketed bar chart with p50/p95/p99 markers.
// values: array of duration_ms. buckets: target column count.
export function LatencyHistogram({
  values,
  buckets = 24,
  width = 480,
  height = 140,
  ariaLabel = "Latency distribution",
}) {
  if (!values || values.length === 0) {
    return <p className="text-dim">No latency samples.</p>;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const max = sorted[sorted.length - 1] || 1;
  const min = sorted[0] || 0;
  const range = max - min || 1;
  const bins = new Array(buckets).fill(0);
  for (const v of sorted) {
    const idx = Math.min(buckets - 1, Math.floor(((v - min) / range) * buckets));
    bins[idx] += 1;
  }
  const peak = Math.max(...bins, 1);
  const pctile = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
  const p50 = pctile(0.5);
  const p95 = pctile(0.95);
  const p99 = pctile(0.99);

  const pad = 8;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2 - 18;
  const barW = innerW / buckets;
  const xOf = (ms) => pad + ((ms - min) / range) * innerW;

  return (
    <div className="latency-histogram">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel}
        preserveAspectRatio="none"
      >
        {bins.map((count, i) => {
          const h = (count / peak) * innerH;
          const x = pad + i * barW;
          const y = pad + (innerH - h);
          return (
            <rect
              key={i}
              x={x + 0.5}
              y={y}
              width={Math.max(barW - 1, 1)}
              height={h}
              fill="var(--primary-soft)"
              opacity={0.85}
            />
          );
        })}
        {[
          { ms: p50, label: "p50", color: "var(--info)" },
          { ms: p95, label: "p95", color: "var(--accent)" },
          { ms: p99, label: "p99", color: "var(--warning)" },
        ].map((m) => (
          <g key={m.label}>
            <line
              x1={xOf(m.ms)}
              x2={xOf(m.ms)}
              y1={pad}
              y2={pad + innerH}
              stroke={m.color}
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <text
              x={xOf(m.ms)}
              y={pad + innerH + 13}
              fontSize="10"
              fill={m.color}
              textAnchor="middle"
              fontFamily="var(--font-mono), monospace"
            >
              {m.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="latency-legend">
        <span><strong>p50</strong> {Math.round(p50)}ms</span>
        <span><strong>p95</strong> {Math.round(p95)}ms</span>
        <span><strong>p99</strong> {Math.round(p99)}ms</span>
      </div>
    </div>
  );
}

// ActivityHeatmap — calendar-style grid (GitHub contribution graph). Color
// intensity scales with bucket count.
export function ActivityHeatmap({
  data,
  days = 28,
  ariaLabel = "Activity per day",
}) {
  // data: Map<dateString-YYYY-MM-DD, count> OR array of {date, count}
  const map = data instanceof Map
    ? data
    : new Map((data || []).map((d) => [d.date, d.count]));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cells = [];
  let max = 0;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = map.get(key) || 0;
    if (count > max) max = count;
    cells.push({ date: key, count });
  }

  function intensity(c) {
    if (c === 0) return 0;
    if (max === 0) return 0;
    const ratio = c / max;
    if (ratio < 0.25) return 1;
    if (ratio < 0.5) return 2;
    if (ratio < 0.75) return 3;
    return 4;
  }

  return (
    <div className="activity-heatmap" role="img" aria-label={ariaLabel}>
      {cells.map((c) => (
        <div
          key={c.date}
          className={`heatmap-cell heat-${intensity(c.count)}`}
          title={`${c.date}: ${c.count} request${c.count === 1 ? "" : "s"}`}
        />
      ))}
    </div>
  );
}

// Group raw events by YYYY-MM-DD date string. Returns Map.
export function bucketByDay(events, getTime) {
  const out = new Map();
  for (const e of events) {
    const t = getTime(e);
    if (!t) continue;
    const d = typeof t === "string" ? new Date(t) : new Date(t);
    const key = d.toISOString().slice(0, 10);
    out.set(key, (out.get(key) || 0) + 1);
  }
  return out;
}
