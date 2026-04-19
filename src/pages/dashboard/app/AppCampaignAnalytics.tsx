import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Search,
  Download,
  Filter,
  Eye,
  MousePointerClick,
  LogOut,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Placeholder hooks (to be implemented)
const useCampaignAnalytics = (appId: string, campaignId: string) => {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
};

const useCampaignEvents = (appId: string, campaignId: string, filters: any) => {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
};

export default function AppCampaignAnalytics() {
  const { appId, campaignId } = useParams<{ appId: string; campaignId: string }>();
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);
  const [eventSearch, setEventSearch] = useState("");
  const [showEventDetails, setShowEventDetails] = useState(false);

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } = useCampaignAnalytics(
    appId || "",
    campaignId || ""
  );
  const { data: eventsData, isLoading: eventsLoading } = useCampaignEvents(appId || "", campaignId || "", {
    eventType: selectedEventType,
  });

  if (!appId || !campaignId) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Invalid app or campaign ID</AlertDescription>
      </Alert>
    );
  }

  if (analyticsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Mock data for demo - replace with real data from API
  const mockAnalytics = {
    campaignId: campaignId,
    name: "Spring Newsletter 2026",
    status: "completed",
    channel: "EMAIL",
    sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    metrics: {
      sentCount: 10000,
      deliveredCount: 9850,
      failedCount: 150,
      bounceCount: 42,
      openCount: 3250,
      clickCount: 850,
      convertedCount: 125,
      unsubscribeCount: 35,
    },
    rates: {
      deliveryRate: 98.5,
      failureRate: 1.5,
      bounceRate: 0.42,
      openRate: 32.5,
      clickRate: 8.5,
      conversionRate: 1.25,
      unsubscribeRate: 0.35,
    },
    eventBreakdown: {
      sent: 10000,
      delivered: 9850,
      opened: 3250,
      clicked: 850,
      converted: 125,
      bounced: 42,
      unsubscribed: 35,
      failed: 150,
    },
  };

  const data = analytics || mockAnalytics;

  // Chart data
  const rateChartData = [
    { name: "Delivery", value: data.rates.deliveryRate },
    { name: "Open", value: data.rates.openRate },
    { name: "Click", value: data.rates.clickRate },
    { name: "Conversion", value: data.rates.conversionRate },
    { name: "Unsubscribe", value: data.rates.unsubscribeRate },
  ];

  const eventChartData = [
    { name: "Sent", value: data.metrics.sentCount },
    { name: "Delivered", value: data.metrics.deliveredCount },
    { name: "Opened", value: data.metrics.openCount },
    { name: "Clicked", value: data.metrics.clickCount },
    { name: "Converted", value: data.metrics.convertedCount },
  ];

  const eventTypeData = [
    { name: "Delivered", value: data.metrics.deliveredCount, color: "#10b981" },
    { name: "Opened", value: data.metrics.openCount, color: "#3b82f6" },
    { name: "Clicked", value: data.metrics.clickCount, color: "#8b5cf6" },
    { name: "Failed", value: data.metrics.failedCount, color: "#ef4444" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{data.name}</h1>
          <p className="text-sm text-content-secondary mt-1">
            Sent on {new Date(data.sentAt).toLocaleDateString()} · {data.status}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-3.5 w-3.5 mr-2" /> Export Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Delivery Rate */}
        <Card className="border-border/60">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                <Mail className="h-4 w-4 text-success" />
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {data.rates.deliveryRate.toFixed(1)}%
              </Badge>
            </div>
            <p className="text-sm font-medium text-content">Delivery Rate</p>
            <p className="text-xs text-content-secondary mt-2">
              {data.metrics.deliveredCount.toLocaleString()} of {data.metrics.sentCount.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        {/* Open Rate */}
        <Card className="border-border/60">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Eye className="h-4 w-4 text-primary" />
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {data.rates.openRate.toFixed(1)}%
              </Badge>
            </div>
            <p className="text-sm font-medium text-content">Open Rate</p>
            <p className="text-xs text-content-secondary mt-2">
              {data.metrics.openCount.toLocaleString()} opens
            </p>
          </CardContent>
        </Card>

        {/* Click Rate */}
        <Card className="border-border/60">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-8 w-8 rounded-lg bg-purple/10 flex items-center justify-center">
                <MousePointerClick className="h-4 w-4 text-purple" />
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {data.rates.clickRate.toFixed(1)}%
              </Badge>
            </div>
            <p className="text-sm font-medium text-content">Click Rate</p>
            <p className="text-xs text-content-secondary mt-2">
              {data.metrics.clickCount.toLocaleString()} clicks
            </p>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card className="border-border/60">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-warning" />
              </div>
              <Badge variant="secondary" className="text-[10px]">
                {data.rates.conversionRate.toFixed(2)}%
              </Badge>
            </div>
            <p className="text-sm font-medium text-content">Conversion Rate</p>
            <p className="text-xs text-content-secondary mt-2">
              {data.metrics.convertedCount.toLocaleString()} conversions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Rates */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Performance Rates</CardTitle>
            <CardDescription>Key engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rateChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => `${(value as number).toFixed(1)}%`}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Event Distribution */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Event Distribution</CardTitle>
            <CardDescription>Email lifecycle breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={eventTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {eventTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Event Timeline */}
      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Event Timeline</CardTitle>
            <CardDescription>Track engagement over time</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-3.5 w-3.5 mr-1" /> Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={eventChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Recent Events</CardTitle>
            <CardDescription>Latest contact interactions</CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 icon-muted" />
            <Input placeholder="Search events..." className="pl-9 h-8" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {[
              { type: "OPENED", email: "john@example.com", time: "2 hours ago" },
              { type: "CLICKED", email: "jane@example.com", time: "3 hours ago" },
              { type: "DELIVERED", email: "bob@example.com", time: "4 hours ago" },
              { type: "OPENED", email: "alice@example.com", time: "5 hours ago" },
              { type: "CONVERTED", email: "charlie@example.com", time: "6 hours ago" },
              { type: "UNSUBSCRIBED", email: "david@example.com", time: "7 hours ago" },
            ].map((event, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <Badge variant="secondary" className="text-[10px]">
                    {event.type}
                  </Badge>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{event.email}</p>
                    <p className="text-xs text-content-secondary">{event.time}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-content-secondary shrink-0" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
