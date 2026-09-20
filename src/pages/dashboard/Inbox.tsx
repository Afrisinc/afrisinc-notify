import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Mail as MailIcon, Inbox as InboxIcon, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useOrg } from "@/contexts/OrgContext";
import { useOrgThreads } from "@/hooks/useInbox";
import { ComposeWindow } from "@/components/inbox/ComposeWindow";
import type { ThreadSummary } from "@/services/inbox";

function ThreadList({
  threads,
  onOpen,
}: {
  threads: ThreadSummary[];
  onOpen: (threadId: string) => void;
}) {
  if (threads.length === 0) {
    return (
      <div className="p-12 text-center text-content-secondary border border-dashed border-border rounded-lg">
        <InboxIcon className="h-10 w-10 mx-auto mb-3 opacity-50" />
        <p>
          No threads yet. Click the compose button to start a conversation, or
          enable inbound receiving on a domain.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {threads.map((thread) => (
        <button
          key={thread.id}
          onClick={() => onOpen(thread.id)}
          className="w-full text-left flex items-start gap-3 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors bg-card"
        >
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <MailIcon className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium truncate">
                {thread.contactEmail}
              </span>
              <span className="text-xs text-content-secondary shrink-0">
                {formatDistanceToNow(new Date(thread.lastMessageAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <p className="text-sm text-content-secondary truncate">
              {thread.subject || "(no subject)"} · {thread.appName}
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
}

const Inbox = () => {
  const navigate = useNavigate();
  const { currentOrg } = useOrg();
  const { data, isLoading } = useOrgThreads(currentOrg?.id, {
    page: 1,
    pageSize: 50,
  });
  const threads = data?.threads ?? [];
  const [composeOpen, setComposeOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="heading-section">Inbox</h1>
        <p className="text-content-secondary text-sm">
          Every reply to a transactional email across all your apps and domains.
        </p>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => setComposeOpen((v) => !v)}
            className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
            aria-label={composeOpen ? "Close compose" : "Compose new email"}
          >
            <Plus
              className={`h-6 w-6 transition-transform ${composeOpen ? "rotate-45" : ""}`}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left">
          {composeOpen ? "Close" : "Compose"}
        </TooltipContent>
      </Tooltip>

      <ComposeWindow
        open={composeOpen}
        onOpenChange={setComposeOpen}
        onSent={(threadId) => navigate(`/dashboard/inbox/${threadId}`)}
      />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <ThreadList
          threads={threads}
          onOpen={(threadId) => navigate(`/dashboard/inbox/${threadId}`)}
        />
      )}
    </div>
  );
};

export default Inbox;
