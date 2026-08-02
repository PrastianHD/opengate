import { JsonLd } from "../components/JsonLd";

export const metadata = {
  title: "Status",
  description:
    "OpenGate API status. Check which models and providers are currently available.",
  alternates: {
    canonical: "/status",
  },
};

// Static status — update this when models change.
// TODO: build /api/status endpoint to auto-check upstream health.
const MODELS = [
  {
    name: "Deepseek V4 Flash",
    slug: "deepseek-v4-flash",
    tier: "fast",
    status: "operational",
    latency: "~2-4s",
  },
  {
    name: "Mimo V2.5",
    slug: "mimo-v2.5",
    tier: "fast",
    status: "operational",
    latency: "~3-5s",
  },
  {
    name: "Nemotron 3 Ultra 550B",
    slug: "nemotron-3-ultra-550b-a55b",
    tier: "standard",
    status: "operational",
    latency: "~4-6s",
  },
  {
    name: "Gemma 4 31B",
    slug: "gemma-4-31b-it",
    tier: "standard",
    status: "operational",
    latency: "~3-5s",
  },
];

const STATUS_MAP = {
  operational: { label: "Operational", color: "#10b981" },
  degraded: { label: "Degraded", color: "#f59e0b" },
  down: { label: "Down", color: "#ef4444" },
};

export default function StatusPage() {
  const allOperational = MODELS.every((m) => m.status === "operational");

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Status",
          url: "https://opengate.host/status",
          description: "OpenGate API status page.",
          inLanguage: "en",
        }}
      />
      <div className="section-heading">
        <p className="eyebrow">◆ Status</p>
        <h2>System Status</h2>
        <p>Current availability of models and the API gateway.</p>
      </div>

      <section className="status-section">
        {/* Overall */}
        <div className={`status-banner ${allOperational ? "ok" : "warn"}`}>
          <span
            className="status-dot-lg"
            style={{ background: allOperational ? "#10b981" : "#f59e0b" }}
          />
          <span>
            {allOperational
              ? "All systems operational"
              : "Some systems are experiencing issues"}
          </span>
        </div>

        {/* Gateway */}
        <div className="status-group">
          <h3>Gateway</h3>
          <div className="status-row">
            <div className="status-row-left">
              <span className="status-dot" style={{ background: "#10b981" }} />
              <span>API Endpoint</span>
              <code>api.opengate.host</code>
            </div>
            <span className="status-label ok">Operational</span>
          </div>
          <div className="status-row">
            <div className="status-row-left">
              <span className="status-dot" style={{ background: "#10b981" }} />
              <span>Rate Limiting</span>
            </div>
            <span className="status-label ok">Operational</span>
          </div>
          <div className="status-row">
            <div className="status-row-left">
              <span className="status-dot" style={{ background: "#10b981" }} />
              <span>Authentication</span>
            </div>
            <span className="status-label ok">Operational</span>
          </div>
        </div>

        {/* Models */}
        <div className="status-group">
          <h3>Models</h3>
          {MODELS.map((m) => {
            const s = STATUS_MAP[m.status];
            return (
              <div className="status-row" key={m.slug}>
                <div className="status-row-left">
                  <span className="status-dot" style={{ background: s.color }} />
                  <span>{m.name}</span>
                  <span className={`model-tier ${m.tier}`}>{m.tier}</span>
                </div>
                <div className="status-row-right">
                  <span className="status-latency">{m.latency}</span>
                  <span className={`status-label ${m.status}`}>{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info */}
        <div className="status-info">
          <p>
            Status is checked periodically. If you experience issues, try a
            different model or contact{" "}
            <a href="https://t.me/opengate_bot" target="_blank" rel="noreferrer">
              Telegram support
            </a>.
          </p>
        </div>
      </section>
    </>
  );
}
