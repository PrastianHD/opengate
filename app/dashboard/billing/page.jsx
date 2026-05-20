import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Billing | OpenGate",
};

const MICRO_PER_USD = 1_000_000;

function formatUsd(microCents, fractionDigits = 4) {
  const usd = (microCents || 0) / MICRO_PER_USD;
  return usd.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: 2,
  });
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const KIND_LABEL = {
  topup: "Top-up",
  debit: "Usage",
  refund: "Refund",
  adjust: "Adjustment",
  bonus: "Bonus",
};

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: appUser }, { data: txns }] = await Promise.all([
    supabase
      .from("users")
      .select("balance_micro_cents")
      .eq("id", user.id)
      .single(),
    supabase
      .from("transactions")
      .select(
        "id, kind, amount_micro_cents, balance_after_micro_cents, description, reference, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <div className="dashboard-page">
      <header className="dashboard-page-head">
        <h1>Billing</h1>
        <p className="dashboard-page-sub">
          Top up credit and review your transaction history.
        </p>
      </header>

      <div className="dashboard-grid">
        <article className="dashboard-stat">
          <span className="dashboard-stat-label">Current balance</span>
          <span className="dashboard-stat-value">
            {formatUsd(appUser?.balance_micro_cents, 2)}
          </span>
          <span className="dashboard-stat-hint">
            Deducted in real time as you make requests.
          </span>
        </article>
        <article className="dashboard-stat dashboard-stat-cta-card">
          <span className="dashboard-stat-label">Top up</span>
          <p className="dashboard-stat-text">
            Manual top-up via Telegram during early access. Stripe + Midtrans
            arrive in Stage 8.
          </p>
          <a
            className="btn btn-primary"
            href="https://t.me/opengate_bot"
            target="_blank"
            rel="noreferrer"
          >
            Open Telegram bot
          </a>
        </article>
      </div>

      <section className="dashboard-section">
        <h2 className="dashboard-section-title">Transactions</h2>

        {!txns || txns.length === 0 ? (
          <div className="dashboard-empty">
            <h3>No transactions yet</h3>
            <p>
              Your top-ups, usage debits, and adjustments will appear here as a
              ledger.
            </p>
          </div>
        ) : (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Balance after</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {txns.map((t) => {
                  const isPositive = t.amount_micro_cents > 0;
                  return (
                    <tr key={t.id}>
                      <td className="dashboard-time">
                        {formatDate(t.created_at)}
                      </td>
                      <td>
                        <span className={`pill pill-${t.kind}`}>
                          {KIND_LABEL[t.kind] || t.kind}
                        </span>
                      </td>
                      <td
                        className={
                          isPositive
                            ? "dashboard-amount-pos"
                            : "dashboard-amount-neg"
                        }
                      >
                        {isPositive ? "+" : ""}
                        {formatUsd(t.amount_micro_cents, 6)}
                      </td>
                      <td>{formatUsd(t.balance_after_micro_cents, 4)}</td>
                      <td className="dashboard-desc">
                        {t.description || (t.reference ? `ref: ${t.reference}` : "—")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
