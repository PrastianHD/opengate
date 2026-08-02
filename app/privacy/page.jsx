export const metadata = {
  title: "Privacy Policy — OpenGate",
  description: "How OpenGate collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-24 text-zinc-300 leading-relaxed">
      <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
      <p className="text-sm text-zinc-500 mb-12">Last updated: August 3, 2026</p>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
          <p>We collect information you provide directly:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Account data</strong> — Telegram ID, display name, and email (if provided)</li>
            <li><strong>Payment data</strong> — Transaction history and payment status (processed by Paywuz; we do not store card/bank details)</li>
            <li><strong>API usage</strong> — Request counts, token usage, and model selections for billing and analytics</li>
            <li><strong>API keys</strong> — Hashed keys only; we cannot recover your plain-text key</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>To authenticate API requests and enforce rate limits</li>
            <li>To process payments and manage your token balance</li>
            <li>To provide customer support via Telegram</li>
            <li>To improve our services and detect abuse</li>
            <li>To send transactional notifications (e.g., payment confirmations)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">3. Data Sharing</h2>
          <p>
            We do <strong>not</strong> sell your personal data. We share information only with:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Payment processors</strong> — Paywuz handles QRIS payments; we receive only transaction status</li>
            <li><strong>AI providers</strong> — Your API prompts are forwarded to upstream providers (e.g., 9Router) to fulfill requests; we do not control their data practices</li>
            <li><strong>Infrastructure</strong> — Supabase (database), Vercel/your VPS (hosting)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">4. Data Retention</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Account data is retained while your account is active</li>
            <li>API usage logs are retained for 90 days for billing disputes</li>
            <li>Payment records are retained for 1 year for accounting</li>
            <li>You may request deletion by contacting us via Telegram</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">5. Security</h2>
          <p>
            We implement industry-standard security measures including encrypted storage, HTTPS for all connections, and API key hashing. However, no method of transmission is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">6. Cookies</h2>
          <p>
            We use essential cookies for authentication and session management. We do not use tracking or advertising cookies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">7. Your Rights</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access your data</li>
            <li>Request correction or deletion</li>
            <li>Export your usage data</li>
            <li>Object to data processing</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">8. Changes</h2>
          <p>
            We may update this policy. Material changes will be announced via the bot or website.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">9. Contact</h2>
          <p>
            For privacy inquiries, contact us via Telegram: <a href="https://t.me/opengateid" className="text-emerald-400 hover:underline">@opengateid</a>
          </p>
        </section>
      </div>
    </main>
  );
}
