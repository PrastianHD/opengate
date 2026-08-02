import ModelsView from "../components/ModelsView";
import { JsonLd } from "../components/JsonLd";

export const metadata = {
  title: "Models",
  description:
    "Browse the top AI models available on the OpenGate gateway. Mix flagship and fast models from one OpenAI-compatible API and switch between them with a single string change.",
  alternates: {
    canonical: "/models",
  },
};

export default function ModelsPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Models",
          url: "https://opengate.host/models",
          description:
            "Top AI models, one gateway. Mix and match flagship and fast models.",
          inLanguage: "en",
        }}
      />
      <div className="section-heading">
        <p className="eyebrow">◆ Models</p>
        <h2>Top AI models, one gateway</h2>
        <p>
          Mix and match flagship and fast models. Switch with a single string
          change, no SDK swap needed.
        </p>
      </div>

      <section className="models-section">
        <ModelsView />
      </section>
    </>
  );
}
