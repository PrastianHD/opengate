"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/docs", label: "Docs" },
    { href: "/models", label: "Models" },
    { href: "/pricing", label: "Pricing" },
  ];

  return (
    <nav className="glass-nav">
      <Link href="/" className="brand-lockup" onClick={() => setOpen(false)}>
        <span className="brand-mark">
          <img src="/logo.svg" alt="OpenGates logo" />
        </span>
        <span>OpenGates</span>
      </Link>

      <button
        className="nav-toggle"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`site-links${open ? " open" : ""}`}>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={pathname === l.href ? "active" : ""}
            onClick={() => setOpen(false)}
          >
            {l.label}
          </Link>
        ))}
      </div>

      <div className="nav-actions">
        <a
          className="nav-pill primary-nav"
          href="https://t.me/opengates_bot"
          target="_blank"
          rel="noreferrer"
        >
          <img src="/telegram.svg" alt="" />
          <span>Telegram</span>
        </a>
      </div>
    </nav>
  );
}
