import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Mail as MailIcon, Inbox as InboxIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyThreads } from "@/hooks/useMailInbox";

const MailInbox = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useMyThreads({ page: 1, pageSize: 50 });
  const threads = data?.threads ?? [];

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-4 space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (threads.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center text-content-secondary">
        <InboxIcon className="h-10 w-10 mx-auto mb-3 opacity-50" />
        <p>No mail yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-2">
      {threads.map((thread) => (
        <button
          key={thread.id}
          onClick={() => navigate(`/mail/${thread.id}`)}
          className="w-full text-left flex items-start gap-3 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors bg-card"
        >
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <MailIcon className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium truncate">
                {thread.appName || thread.domain || "Unknown sender"}
              </span>
              <span className="text-xs text-content-secondary shrink-0">
                {formatDistanceToNow(new Date(thread.lastMessageAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <p className="text-sm text-content-secondary truncate">
              {thread.subject || "(no subject)"}
            </p>
          </div>
          {thread.status === "open" && (
            <Badge variant="secondary" className="shrink-0">
              Open
            </Badge>
          )}
        </button>
      ))}
    </div>
  );
};

export default MailInbox;
