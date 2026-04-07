interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-border ${className}`}
    />
  );
}

export function ParagraphSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <Skeleton className="h-5 w-24" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <Skeleton className="mt-6 h-3 w-36" />
    </div>
  );
}

export function LibraryCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface-alt p-5">
      <Skeleton className="mb-2 h-5 w-32" />
      <Skeleton className="mb-3 h-3 w-20" />
      <Skeleton className="h-1 w-full" />
      <Skeleton className="mt-2 h-3 w-16" />
    </div>
  );
}
