import { SkeletonStatGrid, SkeletonTable } from "@/app/components/Skeleton";

export default function Loading() {
  return (
    <div className="dashboard-page">
      <header className="dashboard-page-head">
        <h1>Billing</h1>
        <p className="dashboard-page-sub">Loading…</p>
      </header>
      <SkeletonStatGrid count={2} />
      <SkeletonTable rows={6} cols={5} />
    </div>
  );
}
