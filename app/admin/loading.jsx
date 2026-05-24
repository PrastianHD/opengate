import { SkeletonStatGrid, SkeletonTable } from "@/app/components/Skeleton";

export default function Loading() {
  return (
    <div className="dashboard-page">
      <header className="dashboard-page-head">
        <h1>Admin Overview</h1>
        <p className="dashboard-page-sub">Loading metrics…</p>
      </header>
      <SkeletonStatGrid count={4} />
      <SkeletonStatGrid count={4} />
      <SkeletonTable rows={4} cols={4} />
    </div>
  );
}
