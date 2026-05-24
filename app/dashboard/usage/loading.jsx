import { SkeletonStatGrid, SkeletonTable } from "@/app/components/Skeleton";

export default function Loading() {
  return (
    <div className="dashboard-page">
      <header className="dashboard-page-head">
        <h1>Usage</h1>
        <p className="dashboard-page-sub">Loading recent requests…</p>
      </header>
      <SkeletonStatGrid count={4} />
      <SkeletonTable rows={8} cols={6} />
    </div>
  );
}
