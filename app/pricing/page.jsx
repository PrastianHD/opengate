import PricingCalculator from "../components/PricingCalculator";

export const metadata = {
  title: "Pricing | OpenGate",
  description: "Pricing tiers for the OpenGate API gateway",
};

const tiers = [
  {
    name: "Buyer",
    price: "$5",
    period: "/ topup",
    featured: false,
    features: [
      "Pay-as-you-go credits",
      "Access to all models",
      "Single managed API key",
      "Usage dashboard",
      "Telegram support",
    ],
    cta: "Start Topup",
  },
  {
    name: "Reseller",
    price: "$19",
    period: "/ month",
    featured: true,
    features: [
      "Issue keys to your customers",
      "Per-key quota & RPM limits",
      "Per-key model whitelist",
      "Custom expiry dates",
      "Bulk balance management",
      "Priority Telegram support",
    ],
    cta: "Become a Reseller",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    featured: false,
    features: [
      "Dedicated infrastructure",
      "Custom rate limits",
      "Branded gateway domain",
      "SLA & uptime guarantee",
      "Direct integration support",
      "Volume discounts",
    ],
    cta: "Contact Sales",
  },
];

export default function PricingPage() {
  return (
    <>
      <div className="section-heading">
        <p className="eyebrow">◆ Pricing</p>
        <h2>Simple pricing, scales with you</h2>
        <p>
          Topup as a buyer, scale as a reseller, or go enterprise. All tiers
          get the same OpenAI-compatible API.
        </p>
      </div>

      <section className="pricing-section">
        <div className="pricing-grid">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`pricing-card${t.featured ? " featured" : ""}`}
            >
              <h3>{t.name}</h3>
              <div className="price">
                {t.price}
                {t.period && <small>{t.period}</small>}
              </div>
              <ul>
                {t.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <a
                className={t.featured ? "btn-primary" : "btn-secondary"}
                href="https://t.me/opengate_bot"
                target="_blank"
                rel="noreferrer"
              >
                {t.cta}
              </a>
            </div>
          ))}
        </div>

        <div className="calc-section">
          <PricingCalculator />
        </div>
      </section>
    </>
  );
}
