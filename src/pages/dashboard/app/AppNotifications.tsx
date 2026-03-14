import { useParams, useNavigate } from "react-router-dom";
import { notificationLogs } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Send, Bell } from "lucide-react";

const statusColor: Record<string, string> = {
  delivered: "bg-success/15 text-success",
  failed: "bg-destructive/15 text-destructive",
  pending: "bg-warning/15 text-warning",
  bounced: "bg-destructive/15 text-destructive",
};

export default function AppNotifications() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const logs = notificationLogs.filter((l) => l.appId === appId).slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{logs.length} recent notifications</p>
        <Button size="sm" onClick={() => navigate(`/dashboard/apps/${appId}/notifications/send`)}>
          <Send className="h-3.5 w-3.5 mr-1.5" /> Send Notification
        </Button>
      </div>

      {logs.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 text-center">
            <Bell className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No notifications sent yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <Card key={log.id} className="border-border/60">
              <CardContent className="flex items-center justify-between py-3 px-4">
                <div className="min-w-0">
                  <span className="text-sm font-medium text-foreground block truncate">{log.templateName}</span>
                  <span className="text-xs text-muted-foreground">{log.recipient} · {log.provider}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className="text-[10px]">{log.channel}</Badge>
                  <Badge variant="secondary" className={`text-[10px] ${statusColor[log.status]}`}>{log.status}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
