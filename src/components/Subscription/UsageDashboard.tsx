import { useUsageDashboard } from "@/hooks/useSubscription";
import { useOrg } from "@/contexts/OrgContext";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle, TrendingUp, Zap } from "lucide-react";

export function UsageDashboard() {
  const { currentOrg } = useOrg();
  const { getAccountIdForOrg } = useUser();
  const accountId = currentOrg ? getAccountIdForOrg(currentOrg.id) : undefined;
  const { data, isLoading, error } = useUsageDashboard(accountId ?? undefined);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-border/60">
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-2 w-full mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-danger/30 bg-danger/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-danger">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load usage dashboard. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const criticalLimits = data.limits.filter((l) => l.percentage >= 95);
  const warningLimits = data.limits.filter(
    (l) => l.percentage >= 80 && l.percentage < 95,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-content">
            Usage & Limits
          </h2>
          <p className="text-sm text-content-secondary mt-1">
            {data.plan} Plan ·{" "}
            {data.status === "active" ? "Active" : "Inactive"} ·{" "}
            {data.billingCycle}
          </p>
        </div>
        <div className="text-right">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            {data.plan}
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalLimits.length > 0 && (
        <Card className="border-danger/30 bg-danger/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-danger">Critical Limits</p>
                <p className="text-sm text-danger/80">
                  You've reached {criticalLimits.length} limit(s):{" "}
                  {criticalLimits.map((l) => l.metric).join(", ")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning Alerts */}
      {warningLimits.length > 0 && criticalLimits.length === 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-warning">Approaching Limits</p>
                <p className="text-sm text-warning/80">
                  {warningLimits.map((l) => l.metric).join(", ")} are
                  approaching their limits
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Limits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.limits.map((limit) => {
          const isUnlimited = limit.limit === -1;
          const percentage = limit.percentage ?? 0;
          const isWarning = percentage >= 80 && percentage < 95;
          const isCritical = percentage >= 95;
          const isGood = percentage < 80;

          let bgColor = "bg-card border-border/60";
          let textColor = "text-content";

          if (isCritical) {
            bgColor = "bg-danger/5 border-danger/30";
            textColor = "text-danger";
          } else if (isWarning) {
            bgColor = "bg-warning/5 border-warning/30";
            textColor = "text-warning";
          } else if (isGood && !isUnlimited) {
            bgColor = "bg-success/5 border-success/30";
          }

          return (
            <Card
              key={limit.metric}
              className={`${bgColor} border transition-colors hover:border-border`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-content-secondary capitalize">
                    {limit.metric.replace(/_/g, " ")}
                  </CardTitle>
                  {isUnlimited ? (
                    <Zap className="h-4 w-4 text-primary" />
                  ) : isCritical ? (
                    <AlertCircle className="h-4 w-4 text-danger" />
                  ) : isWarning ? (
                    <AlertCircle className="h-4 w-4 text-warning" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-success" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {!isUnlimited ? (
                  <>
                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full h-2 bg-content/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            isCritical
                              ? "bg-danger"
                              : isWarning
                                ? "bg-warning"
                                : "bg-success"
                          }`}
                          style={{
                            width: `${Math.min(limit.percentage, 100)}%`,
                          }}
                        />
                      </div>
                      <div className="text-xs text-content-secondary">
                        {limit.percentage ? limit.percentage.toFixed(1) : "0"}%
                        used
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-1">
                      <p className={`text-sm font-semibold ${textColor}`}>
                        {limit.used.toLocaleString()} /{" "}
                        {isUnlimited
                          ? "Unlimited"
                          : limit.limit.toLocaleString()}
                      </p>
                      <p className="text-xs text-content-secondary">
                        {isUnlimited
                          ? "No limit"
                          : `${limit.remaining.toLocaleString()} remaining`}
                      </p>
                    </div>

                    {/* Period */}
                    <p className="text-xs text-content-secondary capitalize">
                      {limit.period === "unlimited"
                        ? "No reset"
                        : `Resets ${limit.period}`}
                    </p>
                  </>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-primary">
                      Unlimited
                    </p>
                    <p className="text-xs text-content-secondary">
                      No limits on this metric
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="border-border/60 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="pt-6">
          <p className="text-sm text-content-secondary">
            📊 Usage data updates every 5 minutes. For real-time metrics, please
            refresh the page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
