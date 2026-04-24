import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAppOverview } from "@/hooks/useApps";
import AppOverviewFilters from "@/components/AppOverviewFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Bell, TrendingUp, AlertTriangle, Activity } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  email: { label: "Email", color: "hsl(var(--primary))" },
  sms: { label: "SMS", color: "hsl(var(--success))" },
  push: { label: "Push", color: "hsl(var(--warning))" },
  inApp: { label: "In-App", color: "hsl(var(--accent-foreground))" },
} satisfies ChartConfig;

export default function AppOverview() {
  const { appId } = useParams<{ appId: string }>();
  const [filters, setFilters] = useState<{
    startDate?: string;
    endDate?: string;
    channels?: string[];
  }>({});

  const { data: overview, isLoading } = useAppOverview(appId || "", filters);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-border/60">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[280px] w-full" />
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!overview) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="py-8 text-center">
          <p className="text-destructive">Failed to load overview</p>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      label: "Sent Today",
      value: overview.recentActivity.totalToday,
      icon: Activity,
      color: "text-primary",
    },
    {
      label: "Total Sent",
      value: overview.stats.totalNotificationsSent,
      icon: Mail,
      color: "text-primary",
    },
    {
      label: "Templates",
      value: overview.stats.totalTemplates,
      icon: Bell,
      color: "text-success",
    },
    {
      label: "Active Keys",
      value: overview.stats.activeApiKeys,
      icon: TrendingUp,
      color: "text-warning",
    },
    {
      label: "This Week",
      value: overview.recentActivity.totalThisWeek,
      icon: Activity,
      color: "text-accent",
    },
    {
      label: "This Month",
      value: overview.recentActivity.totalThisMonth,
      icon: AlertTriangle,
      color: "text-destructive",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <AppOverviewFilters onFilterChange={setFilters} />

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((m) => (
          <Card key={m.label} className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-content-secondary font-medium">
                  {m.label}
                </span>
                <m.icon className={`h-3.5 w-3.5 ${m.color}`} />
              </div>
              <div className="text-2xl font-bold text-content">{m.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-content-secondary">
            Notifications Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <AreaChart
              data={overview.chartData}
              margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="email"
                stackId="1"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="sms"
                stackId="1"
                stroke="hsl(var(--success))"
                fill="hsl(var(--success))"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="push"
                stackId="1"
                stroke="hsl(var(--warning))"
                fill="hsl(var(--warning))"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="inApp"
                stackId="1"
                stroke="hsl(var(--accent-foreground))"
                fill="hsl(var(--accent-foreground))"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-content-secondary">
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm py-2 border-b border-border/40">
              <span className="text-content-secondary">Environment</span>
              <Badge variant="outline">{overview.environment}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm py-2 border-b border-border/40">
              <span className="text-content-secondary">Total API Keys</span>
              <span className="font-medium">{overview.stats.totalApiKeys}</span>
            </div>
            <div className="flex items-center justify-between text-sm py-2">
              <span className="text-content-secondary">Last Updated</span>
              <span className="text-xs text-content-secondary">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
