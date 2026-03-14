import { useParams } from "react-router-dom";
import { apps, notificationLogs, notificationsOverTime } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Bell, Monitor, TrendingUp, AlertTriangle, Activity } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";

const chartConfig = {
  email: { label: "Email", color: "hsl(var(--primary))" },
  sms: { label: "SMS", color: "hsl(var(--success))" },
  push: { label: "Push", color: "hsl(var(--warning))" },
  inApp: { label: "In-App", color: "hsl(var(--accent-foreground))" },
} satisfies ChartConfig;

const statusColor: Record<string, string> = {
  delivered: "text-success",
  failed: "text-destructive",
  pending: "text-warning",
  bounced: "text-destructive",
};

export default function AppOverview() {
  const { appId } = useParams();
  const app = apps.find((a) => a.id === appId);
  const logs = notificationLogs.filter((l) => l.appId === appId);

  if (!app) return null;

  const todayLogs = logs; // mock: treat all as today
  const emailsSent = todayLogs.filter((l) => l.channel === "email").length;
  const smsSent = todayLogs.filter((l) => l.channel === "sms").length;
  const pushSent = todayLogs.filter((l) => l.channel === "push").length;
  const delivered = todayLogs.filter((l) => l.status === "delivered").length;
  const failed = todayLogs.filter((l) => l.status === "failed" || l.status === "bounced").length;
  const deliveryRate = todayLogs.length > 0 ? Math.round((delivered / todayLogs.length) * 100) : 0;

  const metrics = [
    { label: "Sent Today", value: todayLogs.length, icon: Activity, color: "text-primary" },
    { label: "Emails", value: emailsSent, icon: Mail, color: "text-primary" },
    { label: "SMS", value: smsSent, icon: MessageSquare, color: "text-success" },
    { label: "Push", value: pushSent, icon: Bell, color: "text-warning" },
    { label: "Delivery Rate", value: `${deliveryRate}%`, icon: TrendingUp, color: "text-success" },
    { label: "Failures", value: failed, icon: AlertTriangle, color: "text-destructive" },
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((m) => (
          <Card key={m.label} className="border-border/60">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">{m.label}</span>
                <m.icon className={`h-3.5 w-3.5 ${m.color}`} />
              </div>
              <div className="text-2xl font-bold text-foreground">{m.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Notifications Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <AreaChart data={notificationsOverTime} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="email" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
              <Area type="monotone" dataKey="sms" stackId="1" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.3} />
              <Area type="monotone" dataKey="push" stackId="1" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" fillOpacity={0.3} />
              <Area type="monotone" dataKey="inApp" stackId="1" stroke="hsl(var(--accent-foreground))" fill="hsl(var(--accent-foreground))" fillOpacity={0.2} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {logs.slice(0, 8).map((log) => (
              <div key={log.id} className="flex items-center justify-between text-sm py-2 border-b border-border/40 last:border-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-foreground truncate">{log.templateName}</span>
                    <span className="text-xs text-muted-foreground truncate">{log.recipient}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className="text-[10px]">{log.channel}</Badge>
                  <span className={`text-xs font-medium capitalize ${statusColor[log.status]}`}>
                    {log.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
