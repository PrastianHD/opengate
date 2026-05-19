"use client";

import { useMemo, useState } from "react";

const calcModels = [
  { name: "Claude Opus 4.7", inputPrice: 15.0, outputPrice: 75.0 },
  { name: "Claude Sonnet 4.6", inputPrice: 3.0, outputPrice: 15.0 },
  { name: "Claude Haiku 4.5", inputPrice: 0.8, outputPrice: 4.0 },
  { name: "Minimax 2.7", inputPrice: 1.2, outputPrice: 4.8 },
  { name: "Minimax 2.5", inputPrice: 0.6, outputPrice: 2.4 },
  { name: "Deepseek V4 Pro", inputPrice: 0.55, outputPrice: 2.19 },
  { name: "Deepseek V4 Flash", inputPrice: 0.14, outputPrice: 0.28 },
  { name: "GLM 5.1", inputPrice: 0.5, outputPrice: 2.0 },
  { name: "GLM 5", inputPrice: 0.3, outputPrice: 1.2 },
  { name: "GPT 5.3 Codex", inputPrice: 5.0, outputPrice: 20.0 },
  { name: "GPT 5.5", inputPrice: 8.0, outputPrice: 32.0 },
  { name: "GPT 5.4", inputPrice: 4.5, outputPrice: 18.0 },
];

const PRESETS = [
  { label: "Hobby", input: 100_000, output: 30_000 },
  { label: "Side-project", input: 1_000_000, output: 300_000 },
  { label: "Production", input: 10_000_000, output: 3_000_000 },
  { label: "Scale", input: 100_000_000, output: 30_000_000 },
];

function format(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 0)}K`;
  return n.toLocaleString("en-US");
}

function formatMoney(n) {
  if (n < 0.01) return `$${n.toFixed(4)}`;
  if (n < 10) return `$${n.toFixed(2)}`;
  if (n < 1000) return `$${n.toFixed(2)}`;
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export default function PricingCalculator() {
  const [modelIdx, setModelIdx] = useState(1);
  const [inputTokens, setInputTokens] = useState(1_000_000);
  const [outputTokens, setOutputTokens] = useState(300_000);

  const model = calcModels[modelIdx];

  const { inputCost, outputCost, total } = useMemo(() => {
    const inputCost = (inputTokens / 1_000_000) * model.inputPrice;
    const outputCost = (outputTokens / 1_000_000) * model.outputPrice;
    return { inputCost, outputCost, total: inputCost + outputCost };
  }, [inputTokens, outputTokens, model]);

  function applyPreset(preset) {
    setInputTokens(preset.input);
    setOutputTokens(preset.output);
  }

  return (
    <div className="calc-card">
      <div className="calc-head">
        <h3>Estimate your monthly cost</h3>
        <p>Slide tokens, pick a model. Markup-free transparent pricing per 1M tokens.</p>
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
              <option key={m.name} value={i}>
                {m.name} — ${m.inputPrice}/{m.outputPrice} per 1M
              </option>
            ))}
          </select>
        </div>

        <div className="calc-field">
          <label>
            Input tokens / month
            <strong>{format(inputTokens)}</strong>
          </label>
          <input
            type="range"
            min="10000"
            max="200000000"
            step="10000"
            value={inputTokens}
            onChange={(e) => setInputTokens(Number(e.target.value))}
          />
          <div className="calc-range-meta">
            <span>10K</span>
            <span>200M</span>
          </div>
        </div>

        <div className="calc-field">
          <label>
            Output tokens / month
            <strong>{format(outputTokens)}</strong>
          </label>
          <input
            type="range"
            min="1000"
            max="50000000"
            step="1000"
            value={outputTokens}
            onChange={(e) => setOutputTokens(Number(e.target.value))}
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
            <span className="num">{formatMoney(inputCost)}</span>
          </div>
          <div className="calc-line">
            <span>Output</span>
            <span className="num">
              {format(outputTokens)} × ${model.outputPrice}/M
            </span>
            <span className="num">{formatMoney(outputCost)}</span>
          </div>
        </div>
        <div className="calc-total">
          <span>Estimated monthly</span>
          <strong>{formatMoney(total)}</strong>
        </div>
      </div>
    </div>
  );
}
