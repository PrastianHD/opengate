import Link from "next/link";
import HoverCard from "./components/HoverCard";
import AnimatedTerminal from "./components/AnimatedTerminal";
import IntegrationLogos from "./components/IntegrationLogos";
import MetricsStrip from "./components/MetricsStrip";
import { JsonLd } from "./components/JsonLd";

export const metadata = {
  title: "OpenGate — AI API Gateway for Resellers",
  description:
    "Sell, control, and route AI access from one branded gateway. OpenGate gives resellers, buyers, and builders OpenAI-compatible chat, responses, and image generation with managed API keys, usage visibility, and quota controls.",
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "OpenGate",
          url: "https://opengate.host",
          description:
            "OpenAI-compatible AI API gateway for resellers, buyers, and builders.",
          inLanguage: "en",
        }}
      />
      <section id="home" className="atelier-hero">
        <div className="hero-copy atelier-copy">
          <p className="eyebrow">◆ Private AI Gateway Studio</p>
          <h1>
            Sell, control, and route <span>AI access</span> from one branded gateway.
          </h1>
          <p className="hero-text">
            OpenGate gives resellers, buyers, and builders a polished gateway
            for OpenAI-compatible chat, responses, image generation, managed
            API keys, usage visibility, and quota controls.
          </p>
          <div className="hero-cta">
            <a
              className="btn-primary"
              href="https://t.me/opengate_bot"
              target="_blank"
              rel="noreferrer"
            >
              Get Started →
            </a>
            <Link href="/docs" className="btn-secondary">
              Read Docs
            </Link>
          </div>
        </div>

        <div className="home-showcase-panel">
          <AnimatedTerminal />
        </div>
      </section>

      <IntegrationLogos />

      <MetricsStrip />

      <section className="feature-strip home-feature-strip">
        <HoverCard>
          <span>01</span>
          <i>◆</i>
          <h3>Managed API keys</h3>
          <p>
            Create, revoke, expire, and restrict customer keys without touching
            upstream provider credentials.
          </p>
        </HoverCard>
        <HoverCard>
          <span>02</span>
          <i>◆</i>
          <h3>OpenAI-compatible routes</h3>
          <p>
            Drop the gateway into IDEs, agents, SDKs, and dashboards that
            support custom OpenAI base URLs.
          </p>
        </HoverCard>
        <HoverCard>
          <span>03</span>
          <i>◆</i>
          <h3>Usage-first controls</h3>
          <p>
            Track requests, token spend, model access, RPM limits, and quota
            from one clean control panel.
          </p>
        </HoverCard>
      </section>

      <section className="split-section home-ops-section">
        <div className="sticky-heading">
          <p className="eyebrow">Built for real operations</p>
          <h2>Everything your customers need, without exposing your master keys.</h2>
          <p className="muted">
            Connect tools once, sell access safely, and keep usage under
            control with clear limits and model permissions.
          </p>
        </div>
        <div className="code-stack ops-card-grid">
          <HoverCard className="code-card">
            <b>Customer onboarding</b>
            <p>
              Issue dedicated API keys for buyers or reseller accounts, each
              with its own token limit, RPM limit, expiry date, and allowed
              models.
            </p>
          </HoverCard>
          <HoverCard className="code-card">
            <b>Drop-in integrations</b>
            <p>
              Use one base URL across compatible clients like Claude Code, Cursor,
              Continue, Cline, Roo Code, OpenCode, and custom backend services.
            </p>
          </HoverCard>
          <HoverCard className="code-card">
            <b>Usage visibility</b>
            <p>
              Monitor requests and token usage so you can understand
              consumption, troubleshoot customers, and protect your balance.
            </p>
          </HoverCard>
        </div>
      </section>
    </>
  );
}
