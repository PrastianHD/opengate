export const metadata = {
  title: "Terms of Service — OpenGate",
  description: "Terms and conditions for using OpenGate AI API services.",
};

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-24 text-zinc-300 leading-relaxed">
      <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
      <p className="text-sm text-zinc-500 mb-12">Last updated: August 3, 2026</p>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance</h2>
          <p>
            By accessing or using OpenGate, you agree to these Terms. If you do not agree, do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">2. Service Description</h2>
          <p>
            OpenGate provides an AI API gateway that proxies requests to various AI models. Our service includes:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>OpenAI-compatible API endpoint</li>
            <li>Token-based billing (pay-as-you-go or packages)</li>
            <li>Telegram bot for account management and purchases</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">3. Account</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>You must be at least 18 years old to use OpenGate</li>
            <li>One account per person; no duplicate accounts</li>
            <li>You are responsible for securing your API keys</li>
            <li>We reserve the right to suspend accounts that violate these Terms</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">4. Payments</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>All purchases are final and non-refundable</li>
            <li>Token balances do not expire</li>
            <li>Prices may change with 30 days notice</li>
            <li>Payments are processed by Paywuz; we do not store payment credentials</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">5. Usage Limits</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Rate limits apply per API key (default: 200 RPM)</li>
            <li>Spending caps may be configured per key</li>
            <li>We may throttle or block abusive usage without notice</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">6. Intellectual Property</h2>
          <p>
            OpenGate code, branding, and documentation are proprietary. You receive a limited license to use the API services as intended. You may not:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Resell or redistribute API access without authorization</li>
            <li>Reverse-engineer our gateway or infrastructure</li>
            <li>Use our branding to imply endorsement</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">7. Disclaimer</h2>
          <p>
            OpenGate is provided &quot;as is&quot; without warranties. We are not responsible for AI-generated content, upstream provider outages, or data loss. Your use of AI models is subject to their respective terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">8. Limitation of Liability</h2>
          <p>
            Our total liability shall not exceed the amount you paid in the 30 days preceding the claim. We are not liable for indirect, incidental, or consequential damages.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">9. Termination</h2>
          <p>
            We may terminate your access for violation of these Terms. Upon termination, unused balances are forfeited.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">10. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the Republic of Indonesia. Disputes shall be resolved in Indonesian courts.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">11. Changes</h2>
          <p>
            We reserve the right to modify these Terms. Material changes will be announced via the bot or website. Continued use constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">12. Contact</h2>
          <p>
            Questions? Contact us via Telegram: <a href="https://t.me/opengateid" className="text-emerald-400 hover:underline">@opengateid</a>
          </p>
        </section>
      </div>
    </main>
  );
}
