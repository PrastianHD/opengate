export const metadata = {
  title: "Acceptable Use Policy — OpenGate",
  description: "Rules for using OpenGate AI API services responsibly.",
};

export default function AcceptableUsePage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-24 text-zinc-300 leading-relaxed">
      <h1 className="text-3xl font-bold text-white mb-8">Acceptable Use Policy</h1>
      <p className="text-sm text-zinc-500 mb-12">Last updated: August 3, 2026</p>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Purpose</h2>
          <p>
            OpenGate provides access to AI models for legitimate purposes. This policy defines acceptable and prohibited uses of our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Prohibited Uses</h2>
          <p>You may <strong>not</strong> use OpenGate to:</p>

          <div className="mt-4 space-y-4">
            <div>
              <h3 className="font-medium text-white">Illegal Activity</h3>
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>Violate any applicable laws or regulations</li>
                <li>Facilitate fraud, money laundering, or terrorism</li>
                <li>Generate content that is illegal in your jurisdiction</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-white">Harmful Content</h3>
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>Generate malware, exploits, or cyberattack tools</li>
                <li>Create phishing content or social engineering attacks</li>
                <li>Produce harassment, hate speech, or threats</li>
                <li>Generate non-consensual intimate content</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-white">Misinformation</h3>
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>Generate deliberate disinformation or propaganda</li>
                <li>Create fake news or impersonate real entities</li>
                <li>Produce misleading health or financial advice</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-white">Abuse</h3>
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>Attempt to circumvent rate limits or security measures</li>
                <li>Resell API access without authorization</li>
                <li>Share API keys publicly or with unauthorized parties</li>
                <li>Conduct automated stress tests without permission</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-white">Intellectual Property</h3>
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>Generate content that infringes on copyrights or trademarks</li>
                <li>Use the service to train competing AI models</li>
                <li>Scrape or mass-harvest AI-generated content</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Permitted Uses</h2>
          <p>OpenGate is designed for:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Software development and coding assistance</li>
            <li>Content creation (articles, marketing, creative writing)</li>
            <li>Data analysis and summarization</li>
            <li>Education and research</li>
            <li>Customer support automation</li>
            <li>Personal productivity and learning</li>
            <li>Integration into your applications and services</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">AI-Generated Content</h2>
          <p>
            You are responsible for reviewing AI-generated content before use. AI outputs may contain inaccuracies, biases, or unintended content. Do not rely solely on AI outputs for critical decisions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Enforcement</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Violation may result in immediate suspension without notice</li>
            <li>Serious violations may result in permanent ban</li>
            <li>We may report illegal activity to law enforcement</li>
            <li>No refunds for suspended accounts</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Reporting</h2>
          <p>
            Report abuse or policy violations via Telegram: <a href="https://t.me/opengateid" className="text-emerald-400 hover:underline">@opengateid</a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Changes</h2>
          <p>
            We may update this policy. Material changes will be announced via the bot or website.
          </p>
        </section>
      </div>
    </main>
  );
}
