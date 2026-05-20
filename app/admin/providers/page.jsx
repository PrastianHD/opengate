import { requireAdminPage } from "@/lib/admin/guard";
import ProviderToggle from "./ProviderToggle";
import UpstreamKeyRow from "./UpstreamKeyRow";
import AddKeyButton from "./AddKeyButton";

export const metadata = {
  title: "Providers | OpenGate Admin",
};

export default async function AdminProvidersPage() {
  const { sbService } = await requireAdminPage();

  const [{ data: providers }, { data: keys }] = await Promise.all([
    sbService
      .from("providers")
      .select("id, slug, name, base_url, adapter, priority, enabled, notes")
      .order("priority"),
    sbService
      .from("upstream_keys")
      .select(
        "id, provider_id, label, api_key_last4, enabled, priority, weight, cooldown_until, last_error, last_error_at, created_at"
      )
      .order("priority"),
  ]);

  const keysByProvider = new Map();
  (keys || []).forEach((k) => {
    if (!keysByProvider.has(k.provider_id)) keysByProvider.set(k.provider_id, []);
    keysByProvider.get(k.provider_id).push(k);
  });

  return (
    <div className="dashboard-page">
      <header className="dashboard-page-head dashboard-page-head-row">
        <div>
          <h1>Providers</h1>
          <p className="dashboard-page-sub">
            Upstream API providers and their keys. The gateway rotates within
            the lowest-priority bucket using weighted random selection.
          </p>
        </div>
        <AddKeyButton providers={providers || []} />
      </header>

      {(providers || []).map((p) => {
        const providerKeys = keysByProvider.get(p.id) || [];
        return (
          <section key={p.id} className="dashboard-section">
            <div className="provider-head">
              <div>
                <h2 className="dashboard-section-title">
                  {p.name}{" "}
                  <span className={`pill pill-${p.enabled ? "active" : "expired"}`}>
                    {p.enabled ? "enabled" : "disabled"}
                  </span>
                </h2>
                <div className="provider-meta">
                  <code>{p.base_url}</code>{" "}
                  <span className="text-dim">·</span>{" "}
                  <span>adapter: {p.adapter}</span>{" "}
                  <span className="text-dim">·</span>{" "}
                  <span>priority: {p.priority}</span>{" "}
                  <span className="text-dim">·</span>{" "}
                  <span>{providerKeys.length} keys</span>
                </div>
              </div>
              <ProviderToggle providerId={p.id} enabled={p.enabled} />
            </div>

            {providerKeys.length === 0 ? (
              <div className="dashboard-empty dashboard-empty-compact">
                <p>No keys configured for this provider.</p>
              </div>
            ) : (
              <div className="dashboard-table-wrap">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Label</th>
                      <th>Key</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Weight</th>
                      <th>Cooldown until</th>
                      <th>Last error</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {providerKeys.map((k) => (
                      <UpstreamKeyRow key={k.id} keyRow={k} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
