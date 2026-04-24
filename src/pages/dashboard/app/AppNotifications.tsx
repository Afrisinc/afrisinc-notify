import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppNotifications } from "@/hooks/useApps";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { SelectFilter } from "@/components/ui/select-filter";
import { ChannelBadge } from "@/components/ui/ChannelBadge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Send,
  Bell,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Channel } from "@/components/ui/ChannelBadge";
import type { AppNotification, AppNotificationsSummary } from "@/services/apps";

// ── Helpers ─────────────────────────────────────────────────

type NotifStatus = "SENT" | "FAILED" | "PENDING" | "BOUNCED" | "QUEUED";

const STATUS_CONFIG: Record<
  NotifStatus,
  { label: string; color: string; Icon: React.FC<{ className?: string }> }
> = {
  SENT: {
    label: "Sent",
    color: "bg-success/10 text-success",
    Icon: CheckCircle2,
  },
  FAILED: {
    label: "Failed",
    color: "bg-destructive/10 text-destructive",
    Icon: XCircle,
  },
  PENDING: {
    label: "Pending",
    color: "bg-warning/10 text-warning",
    Icon: Clock,
  },
  BOUNCED: {
    label: "Bounced",
    color: "bg-destructive/10 text-destructive",
    Icon: AlertTriangle,
  },
  QUEUED: {
    label: "Queued",
    color: "bg-primary/10 text-primary",
    Icon: RefreshCw,
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as NotifStatus] ?? {
    label: status,
    color: "bg-muted text-muted-foreground",
    Icon: Clock,
  };
  const { Icon, color, label } = cfg;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold",
        color,
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {label}
    </span>
  );
}

function formatTime(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatFull(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Date Presets ─────────────────────────────────────────────

function getDatePreset(preset: string): { dateFrom?: string; dateTo?: string } {
  const now = new Date();
  const end = now.toISOString();
  if (preset === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { dateFrom: start.toISOString(), dateTo: end };
  }
  if (preset === "7d") {
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    return { dateFrom: start.toISOString(), dateTo: end };
  }
  if (preset === "30d") {
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    return { dateFrom: start.toISOString(), dateTo: end };
  }
  return {};
}

// ── Summary Bar ──────────────────────────────────────────────

function SummaryBar({
  summary,
  total,
}: {
  summary: AppNotificationsSummary;
  total: number;
}) {
  const stats = [
    { label: "Total", value: total },
    { label: "Delivered", value: summary.deliveredCount },
    { label: "Pending", value: summary.pendingCount },
    { label: "Failed", value: summary.failedCount },
    { label: "Bounced", value: summary.bouncedCount },
  ];

  return (
    <div className="flex items-center gap-px bg-border/40 rounded-xl overflow-hidden border border-border/40">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={cn(
            "flex-1 bg-card px-3 py-2.5 flex flex-col items-center gap-0.5 min-w-0",
            i > 0 && "border-l border-border/40",
          )}
        >
          <span className="text-base font-bold text-foreground tabular-nums">
            {s.value}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium truncate w-full text-center">
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Notification Row ─────────────────────────────────────────

function NotificationRow({ notification }: { notification: AppNotification }) {
  const [open, setOpen] = useState(false);
  const hasLogs = (notification.logs?.length ?? 0) > 0;
  const time = notification.sentAt || notification.createdAt;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className={cn(
          "rounded-xl border transition-all duration-200",
          open
            ? "border-primary/20 bg-card shadow-[0_8px_24px_rgba(2,147,228,0.06)]"
            : "border-border/40 bg-card hover:border-primary/15 hover:shadow-[0_4px_12px_rgba(2,147,228,0.05)]",
        )}
      >
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-left">
            {/* Channel icon */}
            <div className="shrink-0">
              <ChannelBadge channel={notification.channel as Channel} />
            </div>

            {/* Recipient + template */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {notification.recipient}
              </p>
              {notification.templateCode && (
                <p className="text-[11px] font-mono text-muted-foreground/80 mt-0.5 truncate">
                  {notification.templateCode}
                </p>
              )}
            </div>

            {/* Status badges + time + expand */}
            <div className="flex items-center gap-2 shrink-0">
              <StatusBadge status={notification.status} />
              {notification.deliveryState &&
                notification.deliveryState !== notification.status && (
                  <StatusBadge status={notification.deliveryState} />
                )}
              <span className="text-[10px] text-muted-foreground hidden sm:block whitespace-nowrap">
                {formatTime(time)}
              </span>
              {hasLogs ? (
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-muted-foreground/60 transition-transform",
                    open && "rotate-180",
                  )}
                />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30" />
              )}
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 border-t border-border/30 pt-3 space-y-3">
            {/* Meta row */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
              {notification.provider && (
                <span className="flex items-center gap-1">
                  <span className="font-medium">Provider:</span>{" "}
                  {notification.provider}
                </span>
              )}
              {notification.source && (
                <span className="flex items-center gap-1">
                  <span className="font-medium">Source:</span>{" "}
                  {notification.source}
                </span>
              )}
              {notification.retryCount !== undefined &&
                notification.retryCount > 0 && (
                  <span className="flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" />
                    {notification.retryCount}{" "}
                    {notification.retryCount === 1 ? "retry" : "retries"}
                  </span>
                )}
              {time && (
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {formatFull(time)}
                </span>
              )}
            </div>

            {/* Provider logs */}
            {hasLogs ? (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Provider Logs
                </p>
                {notification.logs!.map((log, idx) => {
                  const logCfg = STATUS_CONFIG[log.status as NotifStatus];
                  const responseObj =
                    typeof log.response === "object" && log.response !== null
                      ? log.response
                      : null;
                  return (
                    <div
                      key={idx}
                      className="rounded-lg bg-muted/20 border border-border/20 p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground capitalize">
                          {log.provider}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold",
                            logCfg?.color ?? "bg-muted text-muted-foreground",
                          )}
                        >
                          {logCfg && <logCfg.Icon className="h-3 w-3" />}
                          {log.status}
                        </span>
                      </div>
                      {responseObj && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                          {Object.entries(responseObj).map(([k, v]) => (
                            <div key={k} className="flex gap-1 text-[10px]">
                              <span className="text-muted-foreground font-medium capitalize min-w-[56px]">
                                {k}:
                              </span>
                              <span className="text-foreground/80 truncate">
                                {String(v)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {!responseObj &&
                        typeof log.response === "string" &&
                        log.response && (
                          <p className="text-[11px] text-muted-foreground">
                            {log.response}
                          </p>
                        )}
                      <p className="text-[10px] text-muted-foreground/60">
                        {formatFull(log.createdAt)}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground/60 italic">
                No provider logs recorded yet.
              </p>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// ── Skeleton ──────────────────────────────────────────────────

function NotificationSkeleton() {
  return (
    <div className="rounded-xl border border-border/30 p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-16 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-2.5 w-24" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────

export default function AppNotifications() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [datePreset, setDatePreset] = useState("all");

  const dateRange = getDatePreset(datePreset);

  const { data, isLoading, error, refetch } = useAppNotifications(
    appId ?? "",
    {
      page,
      limit: 15,
      search: search || undefined,
      status: statusFilter !== "all" ? (statusFilter as any) : undefined,
      channel: channelFilter !== "all" ? (channelFilter as any) : undefined,
      ...dateRange,
    },
    { enabled: !!appId },
  );

  const notifications = data?.notifications ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const summary = data?.summary;

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setChannelFilter("all");
    setDatePreset("all");
    setPage(1);
  };

  const hasFilters =
    search ||
    statusFilter !== "all" ||
    channelFilter !== "all" ||
    datePreset !== "all";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-muted-foreground tabular-nums">
          {total > 0 ? (
            <>
              {total} notification{total !== 1 ? "s" : ""}
            </>
          ) : (
            "No notifications"
          )}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs rounded-lg"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs rounded-lg"
            onClick={() =>
              navigate(`/dashboard/apps/${appId}/notifications/send`)
            }
          >
            <Send className="h-3.5 w-3.5" /> Send Notification
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && !isLoading && <SummaryBar summary={summary} total={total} />}

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
          className="flex-1 min-w-[200px] max-w-sm"
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
            { value: "all", label: "All Status" },
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
      </div>

      {/* Error */}
      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-3 px-4">
            <p className="text-sm text-destructive">
              Failed to load notifications.{" "}
              <button onClick={() => refetch()} className="underline">
                Try again
              </button>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <NotificationSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && notifications.length === 0 && (
        <Card className="border-2 border-dashed border-border/30">
          <CardContent className="py-16 text-center space-y-3">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-muted/40 mx-auto">
              <Bell className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {hasFilters
                ? "No notifications match your filters"
                : "No notifications yet"}
            </p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              {hasFilters
                ? "Try adjusting your search or filter criteria."
                : "Send your first notification to see delivery logs appear here."}
            </p>
            {hasFilters ? (
              <Button
                size="sm"
                variant="outline"
                onClick={resetFilters}
                className="mt-2"
              >
                Clear Filters
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() =>
                  navigate(`/dashboard/apps/${appId}/notifications/send`)
                }
                className="mt-2 gap-1.5"
              >
                <Send className="h-3.5 w-3.5" /> Send Notification
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* List */}
      {!isLoading && !error && notifications.length > 0 && (
        <>
          <div className="space-y-2">
            {notifications.map((n) => (
              <NotificationRow key={n.id} notification={n} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
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
