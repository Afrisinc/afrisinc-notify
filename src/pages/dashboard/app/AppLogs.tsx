import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAppNotifications } from "@/hooks/useApps";
import { useExportNotificationLogs } from "@/hooks/useLogs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SearchInput } from "@/components/ui/search-input";
import { SelectFilter } from "@/components/ui/select-filter";
import { ChannelDot } from "@/components/ui/ChannelBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ScrollText,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Channel } from "@/components/ui/ChannelBadge";
import type { AppNotificationsSummary } from "@/services/apps";

// ── Helpers ──────────────────────────────────────────────────

type NotifStatus =
  | "SENT"
  | "FAILED"
  | "PENDING"
  | "BOUNCED"
  | "QUEUED"
  | "DELIVERED";

const STATUS_CONFIG: Record<
  NotifStatus,
  { color: string; Icon: React.FC<{ className?: string }> }
> = {
  SENT: { color: "bg-success/10 text-success", Icon: CheckCircle2 },
  DELIVERED: { color: "bg-success/10 text-success", Icon: CheckCircle2 },
  FAILED: { color: "bg-destructive/10 text-destructive", Icon: XCircle },
  PENDING: { color: "bg-warning/10 text-warning", Icon: Clock },
  BOUNCED: { color: "bg-destructive/10 text-destructive", Icon: AlertTriangle },
  QUEUED: { color: "bg-primary/10 text-primary", Icon: RefreshCw },
};

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as NotifStatus] ?? {
    color: "bg-muted text-muted-foreground",
    Icon: Clock,
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap",
        cfg.color,
      )}
    >
      <cfg.Icon className="h-3 w-3 shrink-0" />
      {status}
    </span>
  );
}

function formatTime(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDatePreset(preset: string): { dateFrom?: string; dateTo?: string } {
  const now = new Date();
  const end = now.toISOString();
  if (preset === "today") {
    const s = new Date(now);
    s.setHours(0, 0, 0, 0);
    return { dateFrom: s.toISOString(), dateTo: end };
  }
  if (preset === "7d") {
    const s = new Date(now);
    s.setDate(s.getDate() - 7);
    return { dateFrom: s.toISOString(), dateTo: end };
  }
  if (preset === "30d") {
    const s = new Date(now);
    s.setDate(s.getDate() - 30);
    return { dateFrom: s.toISOString(), dateTo: end };
  }
  return {};
}

// ── Summary Cards ─────────────────────────────────────────────

function SummaryCards({
  summary,
  total,
}: {
  summary: AppNotificationsSummary;
  total: number;
}) {
  const deliveryPct = summary.deliveryRate ?? 0;

  const stats = [
    { label: "Total sent", value: total, sub: null },
    {
      label: "Delivered",
      value: summary.deliveredCount,
      sub: `${deliveryPct}% rate`,
    },
    { label: "Pending", value: summary.pendingCount, sub: null },
    { label: "Failed", value: summary.failedCount, sub: null },
    { label: "Bounced", value: summary.bouncedCount, sub: null },
  ];

  return (
    <div className="grid grid-cols-3 md:grid-cols-5 gap-px bg-border/40 rounded-xl overflow-hidden border border-border/40">
      {stats.map((s) => (
        <div key={s.label} className="bg-card px-4 py-3 flex flex-col gap-0.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            {s.label}
          </p>
          <p className="text-xl font-bold text-foreground tabular-nums">
            {s.value}
          </p>
          {s.sub && (
            <p className="text-[10px] text-muted-foreground">{s.sub}</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Table Skeleton ────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-8 flex-1 max-w-sm rounded-lg" />
        <Skeleton className="h-8 w-28 rounded-lg" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
      <Card className="border-border/40 overflow-hidden">
        <div className="divide-y divide-border/30">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-36 flex-1" />
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────

export default function AppLogs() {
  const { appId } = useParams<{ appId: string }>();

  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [datePreset, setDatePreset] = useState("all");
  const [page, setPage] = useState(1);
  const [exportError, setExportError] = useState<string | null>(null);

  const dateRange = getDatePreset(datePreset);

  const {
    data,
    isLoading,
    error: fetchError,
  } = useAppNotifications(
    appId ?? "",
    {
      page,
      limit: 25,
      search: search || undefined,
      channel: channelFilter !== "all" ? (channelFilter as any) : undefined,
      status: statusFilter !== "all" ? (statusFilter as any) : undefined,
      ...dateRange,
    },
    { enabled: !!appId },
  );

  const logs = data?.notifications ?? [];
  const summary = data?.summary;
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const exportMutation = useExportNotificationLogs();

  const handleExport = async (format: "csv" | "json") => {
    if (!appId) return;
    setExportError(null);
    try {
      const blob = await exportMutation.mutateAsync({
        appId,
        params: {
          format,
          channel: channelFilter !== "all" ? (channelFilter as any) : undefined,
          status: statusFilter !== "all" ? (statusFilter as any) : undefined,
          ...dateRange,
        },
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `notification-logs-${new Date().toISOString().split("T")[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setExportError((err as Error).message);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setChannelFilter("all");
    setStatusFilter("all");
    setDatePreset("all");
    setPage(1);
  };
  const hasFilters =
    search ||
    channelFilter !== "all" ||
    statusFilter !== "all" ||
    datePreset !== "all";

  if (isLoading) return <TableSkeleton />;

  if (fetchError) {
    return (
      <Alert variant="destructive" className="rounded-xl">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load logs. Please refresh the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {exportError && (
        <Alert variant="destructive" className="rounded-xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{exportError}</AlertDescription>
        </Alert>
      )}

      {/* Summary */}
      {summary && <SummaryCards summary={summary} total={total} />}

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by recipient or template..."
          size="sm"
          className="flex-1 min-w-[180px] max-w-sm"
        />
        <SelectFilter
          value={channelFilter}
          onValueChange={(v) => {
            setChannelFilter(v);
            setPage(1);
          }}
          placeholder="Channel"
          options={[
            { value: "all", label: "All Channels" },
            { value: "EMAIL", label: "Email" },
            { value: "SMS", label: "SMS" },
            { value: "PUSH", label: "Push" },
            { value: "IN_APP", label: "In-App" },
            { value: "WHATSAPP", label: "WhatsApp" },
          ]}
        />
        <SelectFilter
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
          placeholder="Status"
          options={[
            { value: "all", label: "All Statuses" },
            { value: "SENT", label: "Sent" },
            { value: "PENDING", label: "Pending" },
            { value: "QUEUED", label: "Queued" },
            { value: "FAILED", label: "Failed" },
            { value: "BOUNCED", label: "Bounced" },
          ]}
        />
        <SelectFilter
          value={datePreset}
          onValueChange={(v) => {
            setDatePreset(v);
            setPage(1);
          }}
          placeholder="Period"
          options={[
            { value: "all", label: "All Time" },
            { value: "today", label: "Today" },
            { value: "7d", label: "Last 7 Days" },
            { value: "30d", label: "Last 30 Days" },
          ]}
        />
        {hasFilters && (
          <Button
            size="sm"
            variant="ghost"
            onClick={resetFilters}
            className="h-8 text-xs text-muted-foreground"
          >
            Clear
          </Button>
        )}

        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs rounded-lg"
                disabled={exportMutation.isPending || logs.length === 0}
              >
                <Download className="h-3.5 w-3.5" />
                {exportMutation.isPending ? "Exporting..." : "Export"}
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem
                onClick={() => handleExport("csv")}
                className="text-xs gap-2"
              >
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport("json")}
                className="text-xs gap-2"
              >
                Export JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Empty */}
      {logs.length === 0 ? (
        <Card className="border-2 border-dashed border-border/30">
          <CardContent className="py-16 text-center space-y-3">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-muted/40 mx-auto">
              <ScrollText className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {hasFilters
                ? "No logs match your filters"
                : "No notification logs yet"}
            </p>
            {hasFilters && (
              <Button size="sm" variant="outline" onClick={resetFilters}>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-border/40 overflow-hidden rounded-xl shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/40">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-36">
                    Time
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Recipient
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                    Template
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-28">
                    Channel
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-28">
                    Status
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell w-24">
                    Provider
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hidden xl:table-cell">
                    Delivery
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="border-border/30 hover:bg-muted/20"
                  >
                    <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap py-2.5">
                      {formatTime(log.sentAt || log.createdAt)}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <span className="text-sm font-medium truncate max-w-[160px] block">
                        {log.recipient}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 hidden md:table-cell">
                      {log.templateCode ? (
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {log.templateCode}
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground/40">
                          —
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <ChannelDot channel={log.channel as Channel} />
                    </TableCell>
                    <TableCell className="py-2.5">
                      <StatusPill status={log.status} />
                    </TableCell>
                    <TableCell className="py-2.5 hidden lg:table-cell">
                      <span className="text-[11px] text-muted-foreground capitalize">
                        {log.provider || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="py-2.5 hidden xl:table-cell">
                      {log.deliveryState && log.deliveryState !== log.status ? (
                        <StatusPill status={log.deliveryState} />
                      ) : (
                        <span className="text-[11px] text-muted-foreground/40">
                          —
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Page <span className="font-semibold">{page}</span> of{" "}
                {totalPages}
                {" · "}
                {total} total
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="h-8 px-3 text-xs rounded-lg"
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="h-8 px-3 text-xs rounded-lg"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
