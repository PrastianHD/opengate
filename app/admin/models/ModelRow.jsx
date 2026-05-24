"use client";

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

  async function toggleEnabled() {
    const result = await run(`/api/admin/models/${model.id}`, {
      method: "PATCH",
      body: { enabled: !model.enabled },
    });
    if (result.ok) {
      toast.success(model.enabled ? "Model disabled" : "Model enabled");
    }
  }

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
