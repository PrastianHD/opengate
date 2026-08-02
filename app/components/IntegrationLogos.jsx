export default function IntegrationLogos() {
  const logos = [
    { name: "Cursor", letters: "Cu" },
    { name: "Continue", letters: "Co" },
    { name: "Cline", letters: "Cl" },
    { name: "Roo Code", letters: "Rc" },
    { name: "OpenCode", letters: "Oc" },
    { name: "LangChain", letters: "Lc" },
    { name: "LlamaIndex", letters: "Li" },
  ];

  return (
    <section className="integration-strip">
      <div className="integration-inner">
        <p className="integration-eyebrow">Drop-in compatible with</p>
        <div className="integration-logos">
          {logos.map((logo) => (
            <div className="integration-logo" key={logo.name} title={logo.name}>
              <span className="integration-mark" aria-hidden="true">
                {logo.letters}
              </span>
              <span className="integration-name">{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
