"use client";

// Reusable skeleton primitives. Use for Suspense fallbacks across dashboard
// pages so layout shifts stay minimal while data streams in.

export function SkeletonStatGrid({ count = 4 }) {
  return (
    <div className="dashboard-grid">
      {Array.from({ length: count }, (_, i) => (
        <article className="dashboard-stat skeleton-card" key={i}>
          <span className="skeleton skeleton-line" style={{ width: "40%" }} />
          <span className="skeleton skeleton-line skeleton-lg" style={{ width: "60%" }} />
          <span className="skeleton skeleton-line" style={{ width: "75%" }} />
        </article>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 6, cols = 5 }) {
  return (
    <div className="dashboard-table-wrap">
      <table className="dashboard-table">
        <thead>
          <tr>
            {Array.from({ length: cols }, (_, i) => (
              <th key={i}>
                <span className="skeleton skeleton-line" style={{ width: "70%" }} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }, (_, c) => (
                <td key={c}>
                  <span
                    className="skeleton skeleton-line"
                    style={{ width: `${50 + ((r + c) % 4) * 12}%` }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonBlock({ height = 120 }) {
  return <div className="skeleton skeleton-block" style={{ height }} />;
}
