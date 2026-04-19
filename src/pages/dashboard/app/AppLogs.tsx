import { useState } from "react";
import { useParams } from "react-router-dom";
import { useNotificationLogs, useExportNotificationLogs } from "@/hooks/useLogs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollText, Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SearchInput } from "@/components/ui/search-input";

const statusColor: Record<string, string> = {
  delivered: "bg-success/15 text-success",
  failed: "bg-destructive/15 text-destructive",
  pending: "bg-warning/15 text-warning",
  bounced: "bg-destructive/15 text-destructive",
};

export default function AppLogs() {
  const { appId } = useParams<{ appId: string }>();
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [exportError, setExportError] = useState<string | null>(null);

  // Fetch notification logs
  const {
    data: logsResponse,
    isLoading,
    error: fetchError
  } = useNotificationLogs(
    appId || "",
    {
      page,
      limit: 50,
      search: search || undefined,
      channel: channelFilter !== "all" ? (channelFilter as any) : undefined,
      status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    }
  );

  const logs = logsResponse?.notifications || [];
  const summary = logsResponse?.summary;
  const totalPages = logsResponse?.totalPages || 1;

  // Export mutation
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
        },
      });

      // Create download link
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load logs. Please try again.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Export Error Alert */}
      {exportError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{exportError}</AlertDescription>
        </Alert>
      )}

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="border-border/60">
            <div className="p-3 text-center">
              <p className="text-xs text-content-secondary">Total</p>
              <p className="text-xl font-bold text-content">{summary.totalCount}</p>
            </div>
          </Card>
          <Card className="border-border/60">
            <div className="p-3 text-center">
              <p className="text-xs text-content-secondary">Delivered</p>
              <p className="text-xl font-bold text-success">{summary.deliveredCount}</p>
              <p className="text-xs text-success/70">{summary.deliveryRate}%</p>
            </div>
          </Card>
          <Card className="border-border/60">
            <div className="p-3 text-center">
              <p className="text-xs text-content-secondary">Failed</p>
              <p className="text-xl font-bold text-destructive">{summary.failedCount}</p>
              <p className="text-xs text-destructive/70">{summary.failureRate}%</p>
            </div>
          </Card>
          <Card className="border-border/60">
            <div className="p-3 text-center">
              <p className="text-xs text-content-secondary">Pending</p>
              <p className="text-xl font-bold text-warning">{summary.pendingCount}</p>
            </div>
          </Card>
          <Card className="border-border/60">
            <div className="p-3 text-center">
              <p className="text-xs text-content-secondary">Bounced</p>
              <p className="text-xl font-bold text-destructive">{summary.bouncedCount}</p>
            </div>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by email or template..."
          size="sm"
          className="flex-1 max-w-sm"
        />
        <Select value={channelFilter} onValueChange={(v) => { setChannelFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="push">Push</SelectItem>
            <SelectItem value="in_app">In-App</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="bounced">Bounced</SelectItem>
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleExport("csv")}
          disabled={exportMutation.isPending || logs.length === 0}
        >
          <Download className="h-3.5 w-3.5 mr-1.5" />
          {exportMutation.isPending ? "Exporting..." : "Export CSV"}
        </Button>
      </div>

      {logs.length === 0 ? (
        <Card className="border-dashed border-2 py-16 text-center">
          <ScrollText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No logs found.</p>
        </Card>
      ) : (
        <>
          <Card className="border-border/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Provider</TableHead>
                  <TableHead className="hidden xl:table-cell">Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.sentAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </TableCell>
                    <TableCell className="text-sm font-medium truncate max-w-[160px]">{log.recipient}</TableCell>
                    <TableCell className="text-sm text-muted-foreground truncate max-w-[140px]">{log.templateName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">
                        {log.channel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${statusColor[log.status] || "bg-muted/50 text-muted-foreground"}`}
                      >
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                      {log.provider || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-destructive hidden xl:table-cell">
                      {log.errorMessage || "—"}
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
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
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
