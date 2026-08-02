"use client";

// ModelRow — admin Models table row.
// Editable fields:
//   - upstream_model_id (string, e.g. "kr/claude-opus-4.7")
//   - input_price_per_m_usd, output_price_per_m_usd
//   - enabled toggle
//
// Upstream id editing: bound to a shared <datalist id="9router-models">
// populated by SyncFromRouterButton. The datalist is optional — admin can
// still type the id manually.

import { useState } from "react";
import { useApiAction } from "@/app/components/useApiAction";
import { useToast } from "@/app/components/Toast";
import Pill from "@/app/components/Pill";

export default function ModelRow({ model }) {
  const { run, busy, error, setError } = useApiAction();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [inputPrice, setInputPrice] = useState(model.input_price_per_m_usd);
  const [outputPrice, setOutputPrice] = useState(model.output_price_per_m_usd);
  const [upstreamId, setUpstreamId] = useState(model.upstream_model_id || "");
  const [savingUpstream, setSavingUpstream] = useState(false);

  async function savePrice(e) {
    e.preventDefault();
    const result = await run(`/api/admin/models/${model.id}`, {
      method: "PATCH",
      body: {
        input_price_per_m_usd: Number(inputPrice),
        output_price_per_m_usd: Number(outputPrice),
      },
    });
    if (result.ok) {
      setEditing(false);
      toast.success("Pricing saved");
    }
  }

  async function saveUpstream() {
    const trimmed = upstreamId.trim();
    if (trimmed === (model.upstream_model_id || "")) return;
    setSavingUpstream(true);
    const result = await run(`/api/admin/models/${model.id}`, {
      method: "PATCH",
      body: { upstream_model_id: trimmed === "" ? null : trimmed },
      silent: true,
    });
    setSavingUpstream(false);
    if (result.ok) {
      toast.success(`Upstream id saved for ${model.slug}`);
    }
  }

  async function toggleEnabled() {
    const result = await run(`/api/admin/models/${model.id}`, {
      method: "PATCH",
      body: { enabled: !model.enabled },
    });
    if (result.ok) {
      toast.success(model.enabled ? "Model disabled" : "Model enabled");
    }
  }

  const upstreamMissing = !model.upstream_model_id;

  return (
    <tr>
      <td>
        <strong>{model.display_name}</strong>
        <div className="text-dim user-email">
          <code>{model.slug}</code>
        </div>
      </td>
      <td>{model.providers?.name}</td>
      <td>
        <Pill status={model.tier} />
      </td>
      <td>
        <input
          type="text"
          className="model-price-input model-upstream-input"
          list="9router-models"
          placeholder="kr/claude-opus-4.7"
          value={upstreamId}
          onChange={(e) => setUpstreamId(e.target.value)}
          onBlur={saveUpstream}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
          disabled={busy || savingUpstream}
          aria-invalid={upstreamMissing || undefined}
        />
        {upstreamMissing && (
          <div className="text-dim model-upstream-warn">
            unmapped → requests will fail
          </div>
        )}
      </td>
      <td>
        {editing ? (
          <input
            type="number"
            step={0.01}
            min={0}
            value={inputPrice}
            onChange={(e) => setInputPrice(e.target.value)}
            className="model-price-input"
          />
        ) : (
          <span>${model.input_price_per_m_usd.toFixed(2)} /M</span>
        )}
      </td>
      <td>
        {editing ? (
          <input
            type="number"
            step={0.01}
            min={0}
            value={outputPrice}
            onChange={(e) => setOutputPrice(e.target.value)}
            className="model-price-input"
          />
        ) : (
          <span>${model.output_price_per_m_usd.toFixed(2)} /M</span>
        )}
      </td>
      <td>
        <Pill status={model.enabled ? "enabled" : "disabled"} />
      </td>
      <td>
        {editing ? (
          <form onSubmit={savePrice} className="key-actions">
            <button
              type="submit"
              className="key-action"
              disabled={busy}
            >
              Save
            </button>
            <button
              type="button"
              className="key-action"
              onClick={() => {
                setEditing(false);
                setError(null);
                setInputPrice(model.input_price_per_m_usd);
                setOutputPrice(model.output_price_per_m_usd);
              }}
              disabled={busy}
            >
              Cancel
            </button>
            {error && (
              <span className="form-error model-edit-error">{error}</span>
            )}
          </form>
        ) : (
          <div className="key-actions">
            <button
              type="button"
              className="key-action"
              onClick={() => setEditing(true)}
              disabled={busy}
            >
              Edit price
            </button>
            <button
              type="button"
              className={`key-action ${
                model.enabled ? "key-action-danger" : ""
              }`}
              onClick={toggleEnabled}
              disabled={busy}
            >
              {model.enabled ? "Disable" : "Enable"}
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
