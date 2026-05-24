import { SkeletonStatGrid, SkeletonTable } from "@/app/components/Skeleton";

export default function Loading() {
  return (
    <div className="dashboard-page">
      <header className="dashboard-page-head">
        <h1>Overview</h1>
        <p className="dashboard-page-sub">Loading…</p>
      </header>
      <SkeletonStatGrid count={3} />
      <SkeletonTable rows={3} cols={3} />
    </div>
  );
}
