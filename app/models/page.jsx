import ModelsView from "../components/ModelsView";

export const metadata = {
  title: "Models | OpenGates",
  description: "Available AI models on the OpenGates gateway",
};

export default function ModelsPage() {
  return (
    <>
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
