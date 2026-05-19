import CountUp from "./CountUp";

export default function MetricsStrip() {
  return (
    <section className="metrics-strip">
      <div className="metric">
        <span className="metric-value">
          <CountUp end={2.3} decimals={1} suffix="M" />
        </span>
        <span className="metric-label">Requests / day</span>
      </div>
      <div className="metric">
        <span className="metric-value">
          <CountUp end={99.9} decimals={1} suffix="%" />
        </span>
        <span className="metric-label">Uptime</span>
      </div>
      <div className="metric">
        <span className="metric-value">
          <CountUp end={247} suffix="ms" />
        </span>
        <span className="metric-label">Avg latency</span>
      </div>
      <div className="metric">
        <span className="metric-value">
          <CountUp end={12} suffix="+" />
        </span>
        <span className="metric-label">AI models</span>
      </div>
    </section>
  );
}
