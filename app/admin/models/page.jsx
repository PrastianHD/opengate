import { requireAdminPage } from "@/lib/admin/guard";
import ModelRow from "./ModelRow";
import SyncFromRouterButton from "./SyncFromRouterButton";

export const metadata = {
  title: "Models | OpenGate Admin",
};

const MICRO_PER_USD = 1_000_000;

export default async function AdminModelsPage() {
  const { sbService } = await requireAdminPage();
  const { data } = await sbService
    .from("models")
    .select(
      "id, slug, display_name, tier, enabled, upstream_model_id, " +
        "input_price_per_m_micro_cents, output_price_per_m_micro_cents, " +
        "context_tokens, max_output_tokens, providers(slug, name)"
    )
    .order("tier")
    .order("slug");

  const models = (data || []).map((m) => ({
    ...m,
    input_price_per_m_usd: m.input_price_per_m_micro_cents / MICRO_PER_USD,
    output_price_per_m_usd: m.output_price_per_m_micro_cents / MICRO_PER_USD,
  }));

  return (
    <div className="dashboard-page">
      <header className="dashboard-page-head dashboard-page-head-row">
        <div>
          <h1>Models</h1>
          <p className="dashboard-page-sub">
            Final prices charged to users (markup baked in). Edit per-model to
            adjust the spread without changing seed values.
          </p>
        </div>
        <SyncFromRouterButton models={models} />
      </header>

      <div className="dashboard-table-wrap">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Model</th>
              <th>Provider</th>
              <th>Tier</th>
              <th>Upstream id (9Router)</th>
              <th>Input price /M</th>
              <th>Output price /M</th>
              <th>State</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {models.map((m) => (
              <ModelRow key={m.id} model={m} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
