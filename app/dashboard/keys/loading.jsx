import { SkeletonTable } from "@/app/components/Skeleton";

export default function Loading() {
  return (
    <div className="dashboard-page">
      <header className="dashboard-page-head">
        <h1>API Keys</h1>
        <p className="dashboard-page-sub">Loading your keys…</p>
      </header>
      <SkeletonTable rows={5} cols={7} />
    </div>
  );
}
