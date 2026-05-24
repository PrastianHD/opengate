"use client";

import Link from "next/link";

// Reusable empty state for dashboard tables. Replaces ad-hoc <div className="dashboard-empty">
// blocks so callers can express the call-to-action declaratively.
//
// Actions accept either { label, href } (rendered as <Link>) or
// { label, onClick } (rendered as <button>).

export default function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
}) {
  return (
    <div className="dashboard-empty empty-state-cta">
      {icon && (
        <div className="empty-state-icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {(primaryAction || secondaryAction) && (
        <div className="empty-state-actions">
          {primaryAction && <Action {...primaryAction} variant="primary" />}
          {secondaryAction && <Action {...secondaryAction} variant="ghost" />}
        </div>
      )}
    </div>
  );
}

function Action({ label, href, onClick, variant }) {
  const className =
    variant === "primary" ? "btn btn-primary" : "btn btn-ghost";
  if (href) {
    const external = href.startsWith("http");
    if (external) {
      return (
        <a className={className} href={href} target="_blank" rel="noreferrer">
          {label}
        </a>
      );
    }
    return (
      <Link className={className} href={href}>
        {label}
      </Link>
    );
  }
  return (
    <button type="button" className={className} onClick={onClick}>
      {label}
    </button>
  );
}
