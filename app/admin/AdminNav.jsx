"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/providers", label: "Providers" },
  { href: "/admin/models", label: "Models" },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="dashboard-nav">
      {NAV.map(({ href, label }) => {
        const active =
          href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={active ? "is-active" : ""}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
