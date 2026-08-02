import PricingSection from "./PricingSection";
import { JsonLd } from "../components/JsonLd";

export const metadata = {
  title: "Pricing",
  description:
    "OpenGate AI API pricing. Pay-as-you-go balance or buy token packages with bonus. Up to 70% cheaper than official provider prices.",
  alternates: {
    canonical: "/pricing",
  },
};

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
        <PricingSection />
      </section>
    </>
  );
}
