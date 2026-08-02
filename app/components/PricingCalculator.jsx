"use client";

import { useMemo, useState } from "react";
import { MODELS } from "@/lib/catalog";

// Calculator uses OpenGate prices (IDR via USD rate)
const calcModels = MODELS.map((m) => ({
  name: m.name,
  slug: m.slug,
  inputPrice: m.inputPrice,
  outputPrice: m.outputPrice,
}));

const PRESETS = [
  { label: "Hobby", input: 100_000, output: 30_000 },
  { label: "Side-project", input: 1_000_000, output: 300_000 },
  { label: "Production", input: 10_000_000, output: 3_000_000 },
  { label: "Scale", input: 100_000_000, output: 30_000_000 },
];

const IDR_PER_USD = 17_800;

function format(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString("en-US");
}

function formatIDR(n) {
  if (n < 1) return "Rp 0";
  return `Rp ${Math.round(n).toLocaleString("id-ID")}`;
}

function formatUSD(n) {
  if (n < 0.01) return "$0.00";
  return `$${n.toFixed(2)}`;
}

export default function PricingCalculator({ currency = "USD" }) {
  const [modelIdx, setModelIdx] = useState(0);
  const [inputTokens, setInputTokens] = useState(1_000_000);
  const [outputTokens, setOutputTokens] = useState(300_000);

  const model = calcModels[modelIdx];

  const { inputCost, outputCost, total, totalIDR } = useMemo(() => {
    const inputCost = (inputTokens / 1_000_000) * model.inputPrice;
    const outputCost = (outputTokens / 1_000_000) * model.outputPrice;
    const total = inputCost + outputCost;
    const totalIDR = total * IDR_PER_USD;
    return { inputCost, outputCost, total, totalIDR };
  }, [inputTokens, outputTokens, model]);

  function applyPreset(preset) {
    setInputTokens(preset.input);
    setOutputTokens(preset.output);
  }

  return (
    <div className="calc-card">
      <div className="calc-head">
        <h3>Estimate your cost</h3>
        <p>Pick a model, adjust tokens. See price in {currency}.</p>
      </div>

      <div className="calc-presets">
        {PRESETS.map((p) => (
          <button
            type="button"
            key={p.label}
            className="calc-preset"
            onClick={() => applyPreset(p)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="calc-grid">
        <div className="calc-field">
          <label htmlFor="model-select">Model</label>
          <select
            id="model-select"
            value={modelIdx}
            onChange={(e) => setModelIdx(Number(e.target.value))}
          >
            {calcModels.map((m, i) => (
              <option key={m.slug} value={i}>
                {m.name} — ${m.inputPrice}/{m.outputPrice} per 1M
              </option>
            ))}
          </select>
        </div>

        <div className="calc-field">
          <label htmlFor="input-tokens-range">
            Input tokens / month
            <strong>{format(inputTokens)}</strong>
          </label>
          <input
            id="input-tokens-range"
            type="range"
            min="10000"
            max="200000000"
            step="10000"
            value={inputTokens}
            onChange={(e) => setInputTokens(Number(e.target.value))}
            aria-valuemin={10000}
            aria-valuemax={200000000}
            aria-valuenow={inputTokens}
            aria-valuetext={`${format(inputTokens)} tokens`}
          />
          <div className="calc-range-meta">
            <span>10K</span>
            <span>200M</span>
          </div>
        </div>

        <div className="calc-field">
          <label htmlFor="output-tokens-range">
            Output tokens / month
            <strong>{format(outputTokens)}</strong>
          </label>
          <input
            id="output-tokens-range"
            type="range"
            min="1000"
            max="50000000"
            step="1000"
            value={outputTokens}
            onChange={(e) => setOutputTokens(Number(e.target.value))}
            aria-valuemin={1000}
            aria-valuemax={50000000}
            aria-valuenow={outputTokens}
            aria-valuetext={`${format(outputTokens)} tokens`}
          />
          <div className="calc-range-meta">
            <span>1K</span>
            <span>50M</span>
          </div>
        </div>
      </div>

      <div className="calc-result">
        <div className="calc-breakdown">
          <div className="calc-line">
            <span>Input</span>
            <span className="num">
              {format(inputTokens)} × ${model.inputPrice}/M
            </span>
            <span className="num">
              {currency === "USD"
                ? formatUSD(inputCost)
                : formatIDR(inputCost * IDR_PER_USD)}
            </span>
          </div>
          <div className="calc-line">
            <span>Output</span>
            <span className="num">
              {format(outputTokens)} × ${model.outputPrice}/M
            </span>
            <span className="num">
              {currency === "USD"
                ? formatUSD(outputCost)
                : formatIDR(outputCost * IDR_PER_USD)}
            </span>
          </div>
        </div>
        <div className="calc-total">
          <span>Estimated monthly</span>
          <strong>
            {currency === "USD" ? formatUSD(total) : formatIDR(totalIDR)}
          </strong>
          {currency === "USD" ? (
            <small>~{formatIDR(totalIDR)}</small>
          ) : (
            <small>~{formatUSD(total)}</small>
          )}
        </div>
      </div>
    </div>
  );
}
