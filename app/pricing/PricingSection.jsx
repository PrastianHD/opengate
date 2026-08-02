"use client";

import { useState } from "react";
import PricingCalculator from "../components/PricingCalculator";
import { MODELS, PACKAGES } from "@/lib/catalog";

const IDR_PER_USD = 17_800;

// ── Currency Toggle ──

function CurrencyToggle({ currency, setCurrency }) {
  return (
    <div className="currency-toggle">
      <button
        className={`currency-btn${currency === "USD" ? " active" : ""}`}
        onClick={() => setCurrency("USD")}
      >
        USD
      </button>
      <button
        className={`currency-btn${currency === "IDR" ? " active" : ""}`}
        onClick={() => setCurrency("IDR")}
      >
        IDR
      </button>
    </div>
  );
}

// ── Token Packages ──

function PackageCards({ currency }) {
  return (
    <div className="package-grid">
      {PACKAGES.map((p) => (
        <div
          key={p.id}
          className={`package-card${p.featured ? " featured" : ""}`}
        >
          {p.featured && <div className="package-badge">Most Popular</div>}
          <div className="package-name">{p.label}</div>
          <div className="package-price">
            {currency === "USD"
              ? `$${(p.price / IDR_PER_USD).toFixed(2)}`
              : p.priceLabel}
          </div>
          <div className="package-token">
            {p.token.toLocaleString("id-ID")} tokens
          </div>
          {p.bonus > 0 && (
            <div className="package-bonus">+ {p.bonus}% bonus tokens</div>
          )}
          {p.bonus === 0 && <div className="package-bonus dim">No bonus</div>}
          <a
            className={p.featured ? "btn-primary" : "btn-secondary"}
            href="https://t.me/opengate_bot"
            target="_blank"
            rel="noreferrer"
          >
            Buy via Telegram
          </a>
        </div>
      ))}
    </div>
  );
}

// ── Model Rate Card ──

function ModelRateCard({ model, currency }) {
  const inputIDR = Math.round(model.inputPrice * IDR_PER_USD);
  const outputIDR = Math.round(model.outputPrice * IDR_PER_USD);

  return (
    <div className="rate-card">
      <div className="rate-head">
        <div>
          <h4>{model.name}</h4>
          <span className="rate-provider">{model.provider}</span>
        </div>
        <span className={`model-tier ${model.tier}`}>{model.tier}</span>
      </div>
      <p className="rate-desc">{model.description}</p>
      <div className="rate-prices">
        <div className="rate-price-col">
          <span className="rate-label">Input / 1M tokens</span>
          <span className="rate-value">
            {currency === "USD"
              ? `$${model.inputPrice.toFixed(2)}`
              : `Rp ${inputIDR.toLocaleString("id-ID")}`}
          </span>
        </div>
        <div className="rate-price-col">
          <span className="rate-label">Output / 1M tokens</span>
          <span className="rate-value">
            {currency === "USD"
              ? `$${model.outputPrice.toFixed(2)}`
              : `Rp ${outputIDR.toLocaleString("id-ID")}`}
          </span>
        </div>
      </div>
      <div className="rate-meta">
        <span>{model.contextLong}</span>
        <span>·</span>
        <span>{model.output}</span>
        <span>·</span>
        <span>{model.speed} t/s</span>
        {model.tools && <span>·</span>}
        {model.tools && <span className="rate-cap">Tools</span>}
        {model.vision && <span className="rate-cap">Vision</span>}
      </div>
    </div>
  );
}

// ── Section ──

export default function PricingSection() {
  const [currency, setCurrency] = useState("USD");

  return (
    <>
      <div className="pricing-currency-row">
        <CurrencyToggle currency={currency} setCurrency={setCurrency} />
      </div>

      {/* ── Packages ── */}
      <div className="pricing-subheading">
        <h3>Token Packages</h3>
        <p>Buy tokens via Telegram bot. Higher packages = more bonus.</p>
      </div>
      <PackageCards currency={currency} />

      {/* ── Rate Card ── */}
      <div className="pricing-subheading">
        <h3>Per-Model Rates</h3>
        <p>
          Pay-as-you-go. Use tokens from your balance.{" "}
          {currency === "USD"
            ? "1 USD ≈ Rp 17,800"
            : "Rates shown in IDR (1 USD ≈ Rp 17,800)"}
        </p>
      </div>
      <div className="rate-grid">
        {MODELS.map((m) => (
          <ModelRateCard key={m.slug} model={m} currency={currency} />
        ))}
      </div>

      {/* ── Calculator ── */}
      <div className="calc-section">
        <PricingCalculator currency={currency} />
      </div>
    </>
  );
}
