import { useOrg } from "@/contexts/OrgContext";
import { useUser } from "@/contexts/UserContext";
import { useApps } from "@/hooks/useApps";
import { useUsageDashboard } from "@/hooks/useSubscription";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Boxes,
  Send,
  FileText,
  Key,
  AlertCircle,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardHome() {
  const { currentOrg, loading: orgLoading } = useOrg();
  const { getAccountIdForOrg } = useUser();
  const { data: appsData, isLoading: appsLoading } = useApps();

  // Get account ID for usage tracking
  const accountId = currentOrg ? getAccountIdForOrg(currentOrg.id) : undefined;
  const { data: usageData, isLoading: usageLoading } = useUsageDashboard(
    accountId ?? undefined,
  );

  // Handle different response formats - apps can be an array or object with apps property
  const orgApps = Array.isArray(appsData) ? appsData : appsData?.apps || [];
  const isLoading = orgLoading || appsLoading || usageLoading;

  if (isLoading || !currentOrg) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <Skeleton className="h-8 w-48 mb-3" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-border/60">
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalTemplates = orgApps.reduce(
    (s: number, a: any) => s + (a.templateCount || 0),
    0,
  );
  const totalSent = orgApps.reduce(
    (s: number, a: any) => s + (a.notificationsSent || 0),
    0,
  );
  const totalKeys = orgApps.reduce(
    (s: number, a: any) => s + (a.apiKeyCount || 0),
    0,
  );

  const stats = [
    {
      label: "Apps",
      value: orgApps.length,
      icon: Boxes,
      color: "text-primary",
    },
    {
      label: "Templates",
      value: totalTemplates,
      icon: FileText,
      color: "text-success",
    },
    {
      label: "Notifications Sent",
      value: totalSent.toLocaleString(),
      icon: Send,
      color: "text-warning",
    },
    {
      label: "API Keys",
      value: totalKeys,
      icon: Key,
      color: "text-muted-foreground",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-content">
          {currentOrg.name}
        </h1>
        <p className="text-sm text-content-secondary mt-1">
          Organization overview · {currentOrg.plan} plan
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-content-secondary">
                {s.label}
              </CardTitle>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-content">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage & Quota Section */}
      {usageData && usageData.limits && usageData.limits.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-content">
              Usage & Quota
            </h2>
            <span className="text-xs text-content-secondary">
              Billing Cycle: {usageData.billingCycle}
            </span>
          </div>

          {/* Total Account Usage Summary */}
          <Card className="border-border/60 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total Emails Sent */}
                <div>
                  <p className="text-xs text-content-secondary mb-1">
                    Total Emails Sent
                  </p>
                  <p className="text-2xl font-bold text-content">
                    {(
                      usageData.limits.find(
                        (l) => l.metric === "emails_per_month",
                      )?.used || 0
                    ).toLocaleString()}
                  </p>
                </div>

                {/* Remaining This Month */}
                <div>
                  <p className="text-xs text-content-secondary mb-1">
                    Remaining This Month
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {usageData.limits.find(
                      (l) => l.metric === "emails_per_month",
                    )?.limit === -1
                      ? "∞"
                      : (
                          usageData.limits.find(
                            (l) => l.metric === "emails_per_month",
                          )?.remaining || 0
                        ).toLocaleString()}
                  </p>
                </div>

                {/* Usage Percentage */}
                <div>
                  <p className="text-xs text-content-secondary mb-1">
                    Usage Percentage
                  </p>
                  <p className="text-2xl font-bold text-content">
                    {usageData.limits.find(
                      (l) => l.metric === "emails_per_month",
                    )?.limit === -1
                      ? "Unlimited"
                      : `${(usageData.limits.find((l) => l.metric === "emails_per_month")?.percentage || 0).toFixed(1)}%`}
                  </p>
                </div>

                {/* Plan Type */}
                <div>
                  <p className="text-xs text-content-secondary mb-1">
                    Current Plan
                  </p>
                  <p className="text-2xl font-bold text-success">
                    {usageData.plan}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Main Email Quota Card */}
            {usageData.limits
              .filter((limit) => limit.metric === "emails_per_month")
              .map((limit) => {
                const isUnlimited = limit.limit === -1;
                const isWarning =
                  limit.percentage >= 80 && limit.percentage < 95;
                const isCritical = limit.percentage >= 95;

                return (
                  <Card
                    key={limit.metric}
                    className="border-border/60 md:col-span-2"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          Monthly Email Quota
                        </CardTitle>
                        {isCritical && (
                          <AlertCircle className="h-5 w-5 text-danger" />
                        )}
                        {isWarning && (
                          <TrendingUp className="h-5 w-5 text-warning" />
                        )}
                        {!isCritical && !isWarning && (
                          <CheckCircle className="h-5 w-5 text-success" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-content-secondary mb-1">
                            Sent / Limit
                          </p>
                          <p className="text-2xl font-bold text-content">
                            {limit.used.toLocaleString()} /{" "}
                            {isUnlimited
                              ? "Unlimited"
                              : limit.limit.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-content-secondary mb-1">
                            Remaining
                          </p>
                          <p className="text-xl font-semibold text-primary">
                            {isUnlimited
                              ? "∞"
                              : limit.remaining.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {!isUnlimited && (
                        <>
                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div className="w-full h-3 bg-content/10 rounded-full overflow-hidden">
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
                            <div className="flex justify-between text-xs text-content-secondary">
                              <span>
                                {limit.percentage
                                  ? limit.percentage.toFixed(1)
                                  : "0"}
                                % used
                              </span>
                              <span>
                                {limit.percentage
                                  ? (100 - limit.percentage).toFixed(1)
                                  : "100"}
                                % available
                              </span>
                            </div>
                          </div>

                          {/* Status Message */}
                          {isCritical && limit.percentage && (
                            <div className="p-3 rounded-lg bg-danger/10 border border-danger/30">
                              <p className="text-xs text-danger font-medium">
                                ⚠️ Critical: You've used{" "}
                                {limit.percentage.toFixed(0)}% of your monthly
                                quota
                              </p>
                            </div>
                          )}
                          {isWarning && limit.percentage && (
                            <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                              <p className="text-xs text-warning font-medium">
                                ⚠️ Warning: You've used{" "}
                                {limit.percentage.toFixed(0)}% of your monthly
                                quota
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

            {/* All Resource Metrics Grid */}
            {usageData.limits.map((limit) => {
              const isUnlimited = limit.limit === -1;
              const metricLabel = limit.metric
                .replace(/_/g, " ")
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");

              return (
                <Card key={limit.metric} className="border-border/60">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-content-secondary">
                      {metricLabel}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-2xl font-bold text-content">
                        {limit.used.toLocaleString()}
                      </span>
                      <span className="text-xs text-content-secondary font-medium">
                        {isUnlimited
                          ? "∞ Unlimited"
                          : `/ ${limit.limit.toLocaleString()}`}
                      </span>
                    </div>
                    {!isUnlimited &&
                      limit.percentage !== null &&
                      limit.percentage !== undefined && (
                        <div className="space-y-2">
                          <div className="w-full h-2 bg-content/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                limit.percentage >= 95
                                  ? "bg-danger"
                                  : limit.percentage >= 80
                                    ? "bg-warning"
                                    : "bg-success"
                              }`}
                              style={{
                                width: `${Math.min(limit.percentage, 100)}%`,
                              }}
                            />
                          </div>
                          <div className="text-xs text-content-secondary">
                            {limit.remaining.toLocaleString()} remaining •{" "}
                            {limit.percentage
                              ? limit.percentage.toFixed(1)
                              : "0"}
                            % used
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : usageData ? (
        <Card className="bg-warning/5 border-warning/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-warning flex-shrink-0" />
              <div>
                <p className="font-semibold text-warning">
                  Plan Limits Not Available
                </p>
                <p className="text-sm text-warning/80 mt-1">
                  Your plan limits haven't been configured yet. Please contact
                  support or try again later.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Per-App Message Breakdown */}
      {orgApps.length > 0 && (
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">
              Per-App Message Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orgApps.map((app: any) => {
                const sent = app.notificationsSent || 0;
                const totalSent = orgApps.reduce(
                  (s: number, a: any) => s + (a.notificationsSent || 0),
                  0,
                );
                const percentage = totalSent > 0 ? (sent / totalSent) * 100 : 0;

                return (
                  <div key={app.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-content">
                        {app.name}
                      </p>
                      <p className="text-sm font-semibold text-primary">
                        {sent.toLocaleString()} sent
                      </p>
                    </div>
                    <div className="h-2 bg-content/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orgApps.length === 0 ? (
              <p className="text-xs text-content-secondary py-2">No apps yet</p>
            ) : (
              orgApps.slice(0, 3).map((app: any) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between py-2 border-b border-border/40 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-content">
                      {app.name}
                    </p>
                    <p className="text-xs text-content-secondary">
                      {(app.notificationsSent || 0).toLocaleString()} sent
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      app.environment === "production"
                        ? "bg-success/15 text-success"
                        : app.environment === "staging"
                          ? "bg-warning/15 text-warning"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {app.environment || "development"}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
