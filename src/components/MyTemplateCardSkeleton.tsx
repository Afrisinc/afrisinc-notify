import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function MyTemplateCardSkeleton() {
  return (
    <Card className="border-border/40">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <Skeleton className="h-4 w-40 mb-2 bg-muted/60" />
            <Skeleton className="h-3 w-full max-w-xs bg-muted/50" />
          </div>
        </div>

        {/* Badges */}
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full bg-muted/50" />
          <Skeleton className="h-6 w-20 rounded-full bg-muted/50" />
        </div>

        {/* Metrics */}
        <div className="flex gap-4 text-xs border-t border-border/20 pt-3">
          <Skeleton className="h-4 w-12 bg-muted/50" />
          <Skeleton className="h-4 w-16 bg-muted/50" />
          <Skeleton className="h-4 w-12 ml-auto bg-muted/50" />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Skeleton className="h-8 w-16 rounded-lg bg-muted/50" />
          <Skeleton className="h-8 w-20 rounded-lg bg-muted/50" />
          <Skeleton className="h-8 w-24 rounded-lg bg-muted/50" />
          <Skeleton className="h-8 w-16 rounded-lg bg-muted/50" />
          <Skeleton className="h-8 w-20 rounded-lg bg-muted/50 ml-auto" />
        </div>
      </CardContent>
    </Card>
  );
}

export function MyTemplateSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <MyTemplateCardSkeleton key={i} />
      ))}
    </div>
  );
}
