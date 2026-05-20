"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ModelRow({ model }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [inputPrice, setInputPrice] = useState(model.input_price_per_m_usd);
  const [outputPrice, setOutputPrice] = useState(model.output_price_per_m_usd);
  const [error, setError] = useState(null);

  async function patch(body) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/models/${model.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error?.message || "Update failed");
      } else {
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  async function savePrice(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/models/${model.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_price_per_m_usd: Number(inputPrice),
          output_price_per_m_usd: Number(outputPrice),
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error?.message || "Save failed");
      setEditing(false);
      router.refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
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
        <span
          className={`pill pill-${
            model.tier === "flagship"
              ? "active"
              : model.tier === "standard"
              ? "debit"
              : "disabled"
          }`}
        >
          {model.tier}
        </span>
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
        <span className={`pill pill-${model.enabled ? "active" : "expired"}`}>
          {model.enabled ? "enabled" : "disabled"}
        </span>
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
              onClick={() => patch({ enabled: !model.enabled })}
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
