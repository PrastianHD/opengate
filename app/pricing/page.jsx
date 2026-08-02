import PricingCalculator from "../components/PricingCalculator";
import { JsonLd } from "../components/JsonLd";
import { MODELS, PACKAGES } from "@/lib/catalog";

export const metadata = {
  title: "Pricing",
  description:
    "OpenGate AI API pricing. Pay-as-you-go balance or buy token packages with bonus. Up to 70% cheaper than official provider prices.",
  alternates: {
    canonical: "/pricing",
  },
};

// ── Token Packages ──

function PackageCards() {
  return (
    <div className="package-grid">
      {PACKAGES.map((p) => (
        <div
          key={p.id}
          className={`package-card${p.featured ? " featured" : ""}`}
        >
          {p.featured && <div className="package-badge">Most Popular</div>}
          <div className="package-name">{p.label}</div>
          <div className="package-price">{p.priceLabel}</div>
          <div className="package-token">
            {p.token.toLocaleString("id-ID")} tokens
          </div>
          {p.bonus > 0 && (
            <div className="package-bonus">+ {p.bonus}% bonus tokens</div>
          )}
          {p.bonus === 0 && <div className="package-bonus dim">No bonus</div>}
          <a
            className={p.featured ? "btn-primary" : "btn-secondary"}
            href="https://t.me/opengate_bot"
            target="_blank"
            rel="noreferrer"
          >
            Buy via Telegram
          </a>
        </div>
      ))}
    </div>
  );
}

// ── Model Rate Card ──

function ModelRateCard({ model }) {
  return (
    <div className="rate-card">
      <div className="rate-head">
        <div>
          <h4>{model.name}</h4>
          <span className="rate-provider">{model.provider}</span>
        </div>
        <span className={`model-tier ${model.tier}`}>{model.tier}</span>
      </div>
      <p className="rate-desc">{model.description}</p>
      <div className="rate-prices">
        <div className="rate-price-col">
          <span className="rate-label">Input / 1M tokens</span>
          <span className="rate-value">Rp {Math.round(model.inputPrice * 18000).toLocaleString("id-ID")}</span>
        </div>
        <div className="rate-price-col">
          <span className="rate-label">Output / 1M tokens</span>
          <span className="rate-value">Rp {Math.round(model.outputPrice * 18000).toLocaleString("id-ID")}</span>
        </div>
      </div>
      <div className="rate-meta">
        <span>{model.contextLong}</span>
        <span>·</span>
        <span>{model.output}</span>
        <span>·</span>
        <span>{model.speed} t/s</span>
        {model.tools && <span>·</span>}
        {model.tools && <span className="rate-cap">Tools</span>}
        {model.vision && <span className="rate-cap">Vision</span>}
      </div>
    </div>
  );
}

// ── Page ──

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Pricing",
          url: "https://opengate.host/pricing",
          description:
            "Simple pricing. Pay-as-you-go or buy packages. Up to 70% cheaper than official prices.",
          inLanguage: "en",
        }}
      />
      <div className="section-heading">
        <p className="eyebrow">◆ Pricing</p>
        <h2>Simple, transparent pricing</h2>
        <p>
          Pay-as-you-go balance or buy token packages. No hidden fees, no
          surprise charges. Cancel anytime.
        </p>
      </div>

      <section className="pricing-section">

        {/* ── Packages ── */}
        <div className="pricing-subheading">
          <h3>Token Packages</h3>
          <p>Buy tokens via Telegram bot. Higher packages = more bonus.</p>
        </div>
        <PackageCards />

        {/* ── Rate Card ── */}
        <div className="pricing-subheading">
          <h3>Per-Model Rates</h3>
          <p>
            Pay-as-you-go. Use tokens from your balance. Rates shown in IDR
            (approximate, 1 USD ≈ Rp 15.800).
          </p>
        </div>
        <div className="rate-grid">
          {MODELS.map((m) => (
            <ModelRateCard key={m.slug} model={m} />
          ))}
        </div>

        {/* ── Calculator ── */}
        <div className="calc-section">
          <PricingCalculator />
        </div>
      </section>
    </>
  );
}
