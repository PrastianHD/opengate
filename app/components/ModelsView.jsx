"use client";

import { useState } from "react";

const models = [
  {
    name: "Claude Opus 4.7",
    provider: "Anthropic",
    tier: "flagship",
    inputPrice: 15.0,
    outputPrice: 75.0,
    context: "200K",
    speed: 42,
    description: "Anthropic's top-tier model. Best for deep reasoning, agentic workflows, and long-form analysis.",
    contextLong: "200k context",
    output: "32k output",
  },
  {
    name: "Claude Sonnet 4.6",
    provider: "Anthropic",
    tier: "flagship",
    inputPrice: 3.0,
    outputPrice: 15.0,
    context: "200K",
    speed: 78,
    description: "Balanced flagship from Anthropic. Strong coding, writing, and tool use at workhorse pricing.",
    contextLong: "200k context",
    output: "16k output",
  },
  {
    name: "Claude Haiku 4.5",
    provider: "Anthropic",
    tier: "fast",
    inputPrice: 0.8,
    outputPrice: 4.0,
    context: "200K",
    speed: 156,
    description: "Fast and inexpensive. Ideal for chatbots, classification, and structured extraction at scale.",
    contextLong: "200k context",
    output: "8k output",
  },
  {
    name: "Minimax 2.7",
    provider: "Minimax",
    tier: "flagship",
    inputPrice: 1.2,
    outputPrice: 4.8,
    context: "256K",
    speed: 92,
    description: "Latest Minimax flagship with strong multilingual and multimodal capabilities.",
    contextLong: "256k context",
    output: "16k output",
  },
  {
    name: "Minimax 2.5",
    provider: "Minimax",
    tier: "standard",
    inputPrice: 0.6,
    outputPrice: 2.4,
    context: "256K",
    speed: 124,
    description: "Reliable, cost-effective Minimax model for general chat and content generation.",
    contextLong: "256k context",
    output: "8k output",
  },
  {
    name: "Deepseek V4 Pro",
    provider: "Deepseek",
    tier: "flagship",
    inputPrice: 0.55,
    outputPrice: 2.19,
    context: "128K",
    speed: 88,
    description: "Top Deepseek model. Excels at reasoning, math, and repo-scale code generation.",
    contextLong: "128k context",
    output: "16k output",
  },
  {
    name: "Deepseek V4 Flash",
    provider: "Deepseek",
    tier: "fast",
    inputPrice: 0.14,
    outputPrice: 0.28,
    context: "128K",
    speed: 198,
    description: "Lightweight Deepseek variant. Fast, cheap, and capable for high-volume tasks.",
    contextLong: "128k context",
    output: "8k output",
  },
  {
    name: "GLM 5.1",
    provider: "Zhipu",
    tier: "flagship",
    inputPrice: 0.5,
    outputPrice: 2.0,
    context: "128K",
    speed: 95,
    description: "Zhipu's flagship general-purpose model with strong Chinese and English performance.",
    contextLong: "128k context",
    output: "8k output",
  },
  {
    name: "GLM 5",
    provider: "Zhipu",
    tier: "standard",
    inputPrice: 0.3,
    outputPrice: 1.2,
    context: "128K",
    speed: 132,
    description: "Solid general-purpose GLM model. Reliable for chat, summarization, and tool calling.",
    contextLong: "128k context",
    output: "8k output",
  },
  {
    name: "GPT 5.3 Codex",
    provider: "OpenAI",
    tier: "flagship",
    inputPrice: 5.0,
    outputPrice: 20.0,
    context: "256K",
    speed: 64,
    description: "OpenAI's specialized coding model. Built for refactoring, debugging, and agentic dev workflows.",
    contextLong: "256k context",
    output: "16k output",
  },
  {
    name: "GPT 5.5",
    provider: "OpenAI",
    tier: "flagship",
    inputPrice: 8.0,
    outputPrice: 32.0,
    context: "400K",
    speed: 56,
    description: "OpenAI's most advanced general-purpose flagship. Multimodal, strong reasoning, broad knowledge.",
    contextLong: "400k context",
    output: "32k output",
  },
  {
    name: "GPT 5.4",
    provider: "OpenAI",
    tier: "flagship",
    inputPrice: 4.5,
    outputPrice: 18.0,
    context: "256K",
    speed: 72,
    description: "Previous OpenAI flagship. Excellent reasoning and tool use, slightly cheaper than 5.5.",
    contextLong: "256k context",
    output: "16k output",
  },
];

const TIERS = ["all", "flagship", "standard", "fast"];
const PROVIDERS = ["all", "Anthropic", "Minimax", "Deepseek", "Zhipu", "OpenAI"];

export default function ModelsView() {
  const [view, setView] = useState("cards");
  const [tier, setTier] = useState("all");
  const [provider, setProvider] = useState("all");
  const [sort, setSort] = useState("default");

  let filtered = models.filter((m) => {
    if (tier !== "all" && m.tier !== tier) return false;
    if (provider !== "all" && m.provider !== provider) return false;
    return true;
  });

  if (sort === "input-asc") filtered = [...filtered].sort((a, b) => a.inputPrice - b.inputPrice);
  else if (sort === "input-desc") filtered = [...filtered].sort((a, b) => b.inputPrice - a.inputPrice);
  else if (sort === "speed-desc") filtered = [...filtered].sort((a, b) => b.speed - a.speed);
  else if (sort === "speed-asc") filtered = [...filtered].sort((a, b) => a.speed - b.speed);

  return (
    <>
      <div className="models-toolbar">
        <div className="filter-group">
          <span className="filter-label">Tier</span>
          {TIERS.map((t) => (
            <button
              key={t}
              type="button"
              className={`filter-chip${tier === t ? " active" : ""}`}
              onClick={() => setTier(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="filter-group">
          <span className="filter-label">Provider</span>
          {PROVIDERS.map((p) => (
            <button
              key={p}
              type="button"
              className={`filter-chip${provider === p ? " active" : ""}`}
              onClick={() => setProvider(p)}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="view-toggle">
          <button
            type="button"
            className={`view-btn${view === "cards" ? " active" : ""}`}
            onClick={() => setView("cards")}
            aria-label="Card view"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Cards
          </button>
          <button
            type="button"
            className={`view-btn${view === "table" ? " active" : ""}`}
            onClick={() => setView("table")}
            aria-label="Table view"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            Table
          </button>
        </div>
      </div>

      {view === "cards" ? (
        <div className="models-grid">
          {filtered.map((m) => (
            <div className="model-card" key={m.name}>
              <div className="model-card-head">
                <div>
                  <h3>{m.name}</h3>
                  <span className="model-provider">{m.provider}</span>
                </div>
                <span className={`model-tier ${m.tier}`}>{m.tier}</span>
              </div>
              <p>{m.description}</p>
              <div className="model-pricing">
                <span>
                  <small>In</small> ${m.inputPrice.toFixed(2)}
                </span>
                <span>
                  <small>Out</small> ${m.outputPrice.toFixed(2)}
                </span>
                <span>
                  <small>Speed</small> {m.speed} t/s
                </span>
              </div>
              <div className="model-meta">
                <span>{m.contextLong}</span>
                <span>·</span>
                <span>{m.output}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="models-table-wrap">
          <table className="models-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>Provider</th>
                <th>Tier</th>
                <th
                  className={`sortable${sort.startsWith("input") ? " active" : ""}`}
                  onClick={() =>
                    setSort(sort === "input-asc" ? "input-desc" : "input-asc")
                  }
                >
                  Input $/M{" "}
                  <span className="sort-indicator">
                    {sort === "input-asc" ? "↑" : sort === "input-desc" ? "↓" : "↕"}
                  </span>
                </th>
                <th>Output $/M</th>
                <th>Context</th>
                <th
                  className={`sortable${sort.startsWith("speed") ? " active" : ""}`}
                  onClick={() =>
                    setSort(sort === "speed-desc" ? "speed-asc" : "speed-desc")
                  }
                >
                  Speed (t/s){" "}
                  <span className="sort-indicator">
                    {sort === "speed-desc" ? "↓" : sort === "speed-asc" ? "↑" : "↕"}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.name}>
                  <td className="model-name-cell">{m.name}</td>
                  <td>{m.provider}</td>
                  <td>
                    <span className={`model-tier ${m.tier}`}>{m.tier}</span>
                  </td>
                  <td className="num">${m.inputPrice.toFixed(2)}</td>
                  <td className="num">${m.outputPrice.toFixed(2)}</td>
                  <td className="num">{m.context}</td>
                  <td className="num">{m.speed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="empty-state">
          <p>No models match these filters.</p>
        </div>
      )}
    </>
  );
}

export { models };
