"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/docs", label: "Docs" },
  { href: "/models", label: "Models" },
  { href: "/pricing", label: "Pricing" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close drawer when route changes (avoids stale open state on back/forward).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <nav className="glass-nav" aria-label="Primary">
      <Link href="/" className="brand-lockup" onClick={() => setOpen(false)}>
        <span className="brand-mark">
          <Image src="/logo.svg" alt="" width={36} height={36} priority />
        </span>
        <span>OpenGate</span>
      </Link>

      <button
        type="button"
        className="nav-toggle"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="primary-nav-links"
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </button>

      <div
        id="primary-nav-links"
        className={`site-links${open ? " open" : ""}`}
      >
        {LINKS.map((l) => {
          const isActive = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={isActive ? "active" : ""}
              aria-current={isActive ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          );
        })}
      </div>

      <div className="nav-actions">
        <a
          className="nav-pill primary-nav"
          href="https://t.me/opengate_bot"
          target="_blank"
          rel="noreferrer"
        >
          <Image src="/telegram.svg" alt="" width={16} height={16} />
          <span>Telegram</span>
        </a>
      </div>
    </nav>
  );
}
