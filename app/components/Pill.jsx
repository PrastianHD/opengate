// Pill component — colored status badge with semantic icon. Color-blind
// friendly because intent is conveyed by both color AND glyph.
//
// status keys: active, disabled, revoked, expired, cooldown,
//              topup, debit, refund, adjust, bonus, banned, admin, reseller, user

const STATUS_CONFIG = {
  active: { tone: "active", icon: "✓", label: "active" },
  enabled: { tone: "active", icon: "✓", label: "enabled" },
  disabled: { tone: "disabled", icon: "⏸", label: "disabled" },
  revoked: { tone: "revoked", icon: "✕", label: "revoked" },
  expired: { tone: "expired", icon: "⏱", label: "expired" },
  cooldown: { tone: "debit", icon: "❄", label: "cooldown" },
  banned: { tone: "revoked", icon: "🚫", label: "banned" },

  topup: { tone: "active", icon: "↑", label: "top-up" },
  bonus: { tone: "active", icon: "★", label: "bonus" },
  refund: { tone: "active", icon: "↺", label: "refund" },
  debit: { tone: "debit", icon: "↓", label: "usage" },
  adjust: { tone: "disabled", icon: "≈", label: "adjustment" },

  admin: { tone: "active", icon: "★", label: "admin" },
  reseller: { tone: "debit", icon: "◆", label: "reseller" },
  user: { tone: "disabled", icon: "•", label: "user" },

  flagship: { tone: "active", icon: "★", label: "flagship" },
  standard: { tone: "debit", icon: "◆", label: "standard" },
  fast: { tone: "expired", icon: "⚡", label: "fast" },
};

export default function Pill({ status, label, title }) {
  const config = STATUS_CONFIG[status] || {
    tone: "disabled",
    icon: "•",
    label: status,
  };
  const display = label || config.label;
  return (
    <span className={`pill pill-${config.tone}`} title={title}>
      <span className="pill-icon" aria-hidden="true">
        {config.icon}
      </span>
      {display}
    </span>
  );
}
