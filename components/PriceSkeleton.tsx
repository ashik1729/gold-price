export function SpotSkeleton() {
  return (
    <div
      className="animate-pulse rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 p-5"
      aria-hidden="true"
    >
      <div className="h-5 w-28 rounded bg-[var(--surface-light)]" />
      <div className="mt-4 h-7 w-40 rounded bg-[var(--surface-light)]" />
      <div className="mt-2 h-4 w-32 rounded bg-[var(--surface-light)]" />
      <div className="mt-6 h-12 w-48 rounded bg-[var(--surface-light)]" />
      <div className="mt-3 h-6 w-36 rounded bg-[var(--surface-light)]" />
    </div>
  );
}

export function KaratSkeleton() {
  return (
    <div
      className="animate-pulse rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 p-5"
      aria-hidden="true"
    >
      <div className="flex justify-between">
        <div>
          <div className="h-7 w-28 rounded bg-[var(--surface-light)]" />
          <div className="mt-2 h-4 w-20 rounded bg-[var(--surface-light)]" />
        </div>
        <div className="h-10 w-10 rounded-lg bg-[var(--surface-light)]" />
      </div>
      <div className="mt-8 h-8 w-36 rounded bg-[var(--surface-light)]" />
      <div className="mt-3 h-6 w-28 rounded bg-[var(--surface-light)]" />
    </div>
  );
}

export function WeightSkeleton() {
  return (
    <div
      className="animate-pulse rounded-xl border border-[var(--border)] bg-[var(--surface-light)]/40 p-4"
      aria-hidden="true"
    >
      <div className="h-5 w-24 rounded bg-[var(--surface)]" />
      <div className="mt-2 h-3 w-12 rounded bg-[var(--surface)]" />
      <div className="mt-5 h-7 w-28 rounded bg-[var(--surface)]" />
      <div className="mt-2 h-5 w-24 rounded bg-[var(--surface)]" />
    </div>
  );
}

export default function PriceSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading prices">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SpotSkeleton />
        <SpotSkeleton />
        <SpotSkeleton />
        <SpotSkeleton />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KaratSkeleton />
        <KaratSkeleton />
        <KaratSkeleton />
        <KaratSkeleton />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <WeightSkeleton key={i} />
        ))}
      </div>
      <span className="sr-only">Loading live metal prices…</span>
    </div>
  );
}
