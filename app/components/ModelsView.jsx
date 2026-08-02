"use client";

import { useMemo, useState } from "react";
import { MODELS as models, PROVIDERS, TIERS } from "@/lib/catalog";

export default function ModelsView() {
  const [view, setView] = useState("cards");
  const [tier, setTier] = useState("all");
  const [provider, setProvider] = useState("all");
  const [sort, setSort] = useState("default");

  const filtered = useMemo(() => {
    let result = models.filter((m) => {
      if (tier !== "all" && m.tier !== tier) return false;
      if (provider !== "all" && m.provider !== provider) return false;
      return true;
    });

    if (sort === "input-asc") result = [...result].sort((a, b) => a.inputPrice - b.inputPrice);
    else if (sort === "input-desc") result = [...result].sort((a, b) => b.inputPrice - a.inputPrice);
    else if (sort === "speed-desc") result = [...result].sort((a, b) => b.speed - a.speed);
    else if (sort === "speed-asc") result = [...result].sort((a, b) => a.speed - b.speed);

    return result;
  }, [tier, provider, sort]);

  const inputSortDir = sort === "input-asc" ? "ascending" : sort === "input-desc" ? "descending" : "none";
  const speedSortDir = sort === "speed-asc" ? "ascending" : sort === "speed-desc" ? "descending" : "none";

  return (
    <>
      <div className="models-toolbar" role="toolbar" aria-label="Filter models">
        <div className="filter-group" role="group" aria-label="Tier filter">
          <span className="filter-label" id="filter-tier-label">Tier</span>
          {TIERS.map((t) => (
            <button
              key={t}
              type="button"
              className={`filter-chip${tier === t ? " active" : ""}`}
              onClick={() => setTier(t)}
              aria-pressed={tier === t}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="filter-group" role="group" aria-label="Provider filter">
          <span className="filter-label">Provider</span>
          {PROVIDERS.map((p) => (
            <button
              key={p}
              type="button"
              className={`filter-chip${provider === p ? " active" : ""}`}
              onClick={() => setProvider(p)}
              aria-pressed={provider === p}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="view-toggle" role="group" aria-label="View mode">
          <button
            type="button"
            className={`view-btn${view === "cards" ? " active" : ""}`}
            onClick={() => setView("cards")}
            aria-label="Card view"
            aria-pressed={view === "cards"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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
            aria-pressed={view === "table"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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
            <div className="model-card" key={m.slug}>
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSort(sort === "input-asc" ? "input-desc" : "input-asc");
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-sort={inputSortDir}
                >
                  Input $/M{" "}
                  <span className="sort-indicator" aria-hidden="true">
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSort(sort === "speed-desc" ? "speed-asc" : "speed-desc");
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-sort={speedSortDir}
                >
                  Speed (t/s){" "}
                  <span className="sort-indicator" aria-hidden="true">
                    {sort === "speed-desc" ? "↓" : sort === "speed-asc" ? "↑" : "↕"}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.slug}>
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
