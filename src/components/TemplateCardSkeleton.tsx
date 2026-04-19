import { Skeleton } from "@/components/ui/skeleton";

export function TemplateCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/40 bg-card overflow-hidden p-4 space-y-4">
      {/* Image skeleton */}
      <Skeleton className="h-48 w-full rounded-xl bg-muted/50" />

      {/* Content skeleton */}
      <div className="space-y-3">
        {/* Title */}
        <Skeleton className="h-5 w-3/4 bg-muted/60" />

        {/* Description lines */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-full bg-muted/50" />
          <Skeleton className="h-3 w-5/6 bg-muted/50" />
        </div>

        {/* Metrics row */}
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-12 rounded-full bg-muted/50" />
          <Skeleton className="h-6 w-12 rounded-full bg-muted/50" />
          <Skeleton className="h-6 w-12 rounded-full bg-muted/50" />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 flex-1 rounded-lg bg-muted/50" />
          <Skeleton className="h-9 flex-1 rounded-lg bg-muted/50" />
        </div>
      </div>
    </div>
  );
}

export function TemplateSkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <TemplateCardSkeleton key={i} />
      ))}
    </div>
  );
}
