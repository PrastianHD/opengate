"use client";

// Generic sticky sidebar nav used by /dashboard and /admin layouts.
// Active-state matching: exact for the index route, prefix for nested.

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SideNav({ items, ariaLabel = "Section navigation" }) {
  const pathname = usePathname();
  return (
    <nav className="dashboard-nav" aria-label={ariaLabel}>
      {items.map(({ href, label, exact }) => {
        const active = exact
          ? pathname === href
          : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={active ? "is-active" : ""}
            aria-current={active ? "page" : undefined}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
