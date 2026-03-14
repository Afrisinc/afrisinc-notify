import { useOrg } from "@/contexts/OrgContext";
import { useOrganizationApps } from "@/hooks/useOrganization";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Boxes, Send, FileText, Key } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardHome() {
  const { currentOrg, loading: orgLoading } = useOrg();
  const { data: appsData, isLoading: appsLoading } = useOrganizationApps(currentOrg?.id || "", {
    enabled: !!currentOrg?.id && !orgLoading,
  });

  const orgApps = appsData?.data?.apps || [];
  const isLoading = orgLoading || appsLoading;

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

  const totalTemplates = orgApps.reduce((s: number, a: any) => s + (a.templateCount || 0), 0);
  const totalSent = orgApps.reduce((s: number, a: any) => s + (a.notificationsSent || 0), 0);
  const totalKeys = orgApps.reduce((s: number, a: any) => s + (a.apiKeyCount || 0), 0);

  const stats = [
    { label: "Apps", value: orgApps.length, icon: Boxes, color: "text-primary" },
    { label: "Templates", value: totalTemplates, icon: FileText, color: "text-success" },
    { label: "Notifications Sent", value: totalSent.toLocaleString(), icon: Send, color: "text-warning" },
    { label: "API Keys", value: totalKeys, icon: Key, color: "text-muted-foreground" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{currentOrg.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">Organization overview · {currentOrg.plan} plan</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orgApps.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No apps yet</p>
            ) : (
              orgApps.slice(0, 3).map((app: any) => (
                <div key={app.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{app.name}</p>
                    <p className="text-xs text-muted-foreground">{(app.notificationsSent || 0).toLocaleString()} sent</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    app.environment === "production" ? "bg-success/15 text-success" :
                    app.environment === "staging" ? "bg-warning/15 text-warning" :
                    "bg-muted text-muted-foreground"
                  }`}>
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
