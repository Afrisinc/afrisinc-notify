import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function MyTemplateCardSkeleton() {
  return (
    <Card className="rounded-2xl border border-border/40 overflow-hidden">
      <CardContent className="p-5 flex flex-col gap-4">
        {/* Header row */}
        <div className="flex items-start gap-3">
          <Skeleton className="h-9 w-9 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-2.5 w-24" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5 -mt-1">
          <Skeleton className="h-2.5 w-full" />
          <Skeleton className="h-2.5 w-4/5" />
        </div>

        {/* Badges */}
        <div className="flex gap-1.5">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 border-t border-border/20 pt-3">
          <Skeleton className="h-2.5 w-8" />
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-2.5 w-10 ml-auto" />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1 rounded-lg" />
          <Skeleton className="h-8 flex-1 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );
}

export function MyTemplateSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <MyTemplateCardSkeleton key={i} />
      ))}
    </div>
  );
}
