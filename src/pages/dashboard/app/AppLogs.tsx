import { useState } from "react";
import { useParams } from "react-router-dom";
import { notificationLogs } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ScrollText } from "lucide-react";

const statusColor: Record<string, string> = {
  delivered: "bg-success/15 text-success",
  failed: "bg-destructive/15 text-destructive",
  pending: "bg-warning/15 text-warning",
  bounced: "bg-destructive/15 text-destructive",
};

export default function AppLogs() {
  const { appId } = useParams();
  const logs = notificationLogs.filter((l) => l.appId === appId);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = logs.filter((l) => {
    const matchSearch = `${l.recipient} ${l.templateName}`.toLowerCase().includes(search.toLowerCase());
    const matchChannel = channelFilter === "all" || l.channel === channelFilter;
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchChannel && matchStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search logs..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Channel" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="push">Push</SelectItem>
            <SelectItem value="in-app">In-App</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="bounced">Bounced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed border-2 py-16 text-center">
          <ScrollText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No logs found.</p>
        </Card>
      ) : (
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
              {filtered.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </TableCell>
                  <TableCell className="text-sm font-medium truncate max-w-[160px]">{log.recipient}</TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-[140px]">{log.templateName}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px]">{log.channel}</Badge></TableCell>
                  <TableCell><Badge variant="secondary" className={`text-[10px] ${statusColor[log.status]}`}>{log.status}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{log.provider}</TableCell>
                  <TableCell className="text-xs text-destructive hidden xl:table-cell">{log.errorMessage || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
