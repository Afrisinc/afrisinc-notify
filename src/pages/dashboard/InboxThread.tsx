import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Loader2, Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useOrg } from "@/contexts/OrgContext";
import { useOrgThread, useReplyToOrgThread } from "@/hooks/useInbox";
import { parseEmailList } from "@/lib/emailList";

const InboxThread = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentOrg } = useOrg();
  const [reply, setReply] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [cc, setCc] = useState("");

  const { data: thread, isLoading } = useOrgThread(currentOrg?.id, threadId);
  const { mutate: sendReply, isPending: sending } = useReplyToOrgThread(
    currentOrg?.id,
    threadId,
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [thread?.messages.length]);

  const handleSend = () => {
    if (!reply.trim() || sending) return;
    sendReply(
      { body: reply, cc: parseEmailList(cc) },
      {
        onSuccess: () => {
          setReply("");
          setCc("");
          setShowCc(false);
        },
        onError: (error: any) => {
          toast({
            title: "Couldn't send reply",
            description: error.response?.data?.resp_msg || error.message,
            variant: "destructive",
          });
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-3">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="p-8 text-center text-content-secondary">
        Thread not found.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-3 pb-3 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard/inbox")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <h1 className="font-semibold truncate text-content">
            {thread.subject || "(no subject)"}
          </h1>
          <p className="text-xs text-content-secondary truncate">
            {thread.contactEmail} · {thread.appName}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {thread.messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              message.direction === "outbound"
                ? "bg-primary text-primary-foreground ml-auto"
                : "bg-muted text-content mr-auto"
            }`}
          >
            <div className="flex items-center justify-between gap-3 mb-1">
              <span className="text-xs opacity-80 truncate">
                {message.fromAddress}
              </span>
              <span className="text-xs opacity-70 shrink-0">
                {formatDistanceToNow(new Date(message.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            {message.ccAddresses.length > 0 && (
              <p className="text-xs opacity-70 mb-1 truncate">
                Cc: {message.ccAddresses.join(", ")}
              </p>
            )}
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.textBody || message.htmlBody}
            </p>
            {message.attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {message.attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs underline opacity-90"
                  >
                    <Paperclip className="h-3 w-3" />
                    {attachment.filename}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border pt-3 space-y-2">
        {showCc ? (
          <Input
            placeholder="Cc: comma-separated email addresses"
            value={cc}
            onChange={(e) => setCc(e.target.value)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowCc(true)}
            className="text-xs text-content-secondary hover:text-content"
          >
            + Add Cc
          </button>
        )}
        <div className="flex items-end gap-2">
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Reply to ${thread.contactEmail}... (Enter to send, Shift+Enter for a new line)`}
            className="min-h-[60px] resize-none"
          />
          <Button onClick={handleSend} disabled={sending || !reply.trim()}>
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InboxThread;
