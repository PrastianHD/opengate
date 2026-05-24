import { SkeletonTable } from "@/app/components/Skeleton";

export default function Loading() {
  return (
    <div className="dashboard-page">
      <header className="dashboard-page-head">
        <h1>Users</h1>
        <p className="dashboard-page-sub">Loading…</p>
      </header>
      <SkeletonTable rows={8} cols={6} />
    </div>
  );
}
