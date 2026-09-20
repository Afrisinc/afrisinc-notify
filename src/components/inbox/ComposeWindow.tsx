import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Send,
  Minus,
  X,
  Maximize2,
  Minimize2,
  Plus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useOrg } from "@/contexts/OrgContext";
import {
  useMySenders,
  useOrgDomains,
  useAddOrgSender,
} from "@/hooks/useOrgDomains";
import { useComposeOrgThread } from "@/hooks/useInbox";
import { parseEmailList } from "@/lib/emailList";
import { getErrorMessage } from "@/lib/utils";

interface SenderPickerProps {
  orgId: string | undefined;
  senderId: string;
  onSelect: (senderId: string) => void;
}

function SenderPicker({ orgId, senderId, onSelect }: SenderPickerProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentOrg } = useOrg();
  const privileged =
    currentOrg?.userRole === "OWNER" || currentOrg?.userRole === "ADMIN";

  const [creating, setCreating] = useState(false);
  const [localPart, setLocalPart] = useState(user?.email?.split("@")[0] ?? "");
  const [domainId, setDomainId] = useState("");

  const { data: senders, isLoading: sendersLoading } = useMySenders(orgId);
  const { data: domains } = useOrgDomains(privileged ? orgId : undefined);
  const verifiedDomains = (domains ?? []).filter(
    (d) => d.status === "verified",
  );
  const addSenderMutation = useAddOrgSender(orgId);

  const startCreating = () => {
    setLocalPart(user?.email?.split("@")[0] ?? "");
    setDomainId(verifiedDomains[0]?.id ?? "");
    setCreating(true);
  };

  const handleCreate = async () => {
    if (!localPart.trim() || !domainId) return;
    try {
      const sender = await addSenderMutation.mutateAsync({
        domainId,
        payload: { localPart: localPart.trim(), assignedUserId: user?.id },
      });
      toast({ title: "Address created" });
      onSelect(sender.id);
      setCreating(false);
    } catch (error) {
      toast({
        title: "Couldn't create address",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  if (creating) {
    const selectedDomain = verifiedDomains.find((d) => d.id === domainId);
    return (
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border text-sm shrink-0">
        <Input
          value={localPart}
          onChange={(e) => setLocalPart(e.target.value)}
          placeholder="local-part"
          className="h-8 w-32 shrink-0"
        />
        <span className="text-content-secondary shrink-0">@</span>
        {verifiedDomains.length > 1 ? (
          <Select value={domainId} onValueChange={setDomainId}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="domain" />
            </SelectTrigger>
            <SelectContent>
              {verifiedDomains.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="text-sm truncate">{selectedDomain?.domain}</span>
        )}
        <Button
          size="sm"
          onClick={handleCreate}
          disabled={
            addSenderMutation.isPending || !localPart.trim() || !domainId
          }
        >
          {addSenderMutation.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            "Create"
          )}
        </Button>
        <button
          type="button"
          onClick={() => setCreating(false)}
          className="text-xs text-content-secondary hover:text-content shrink-0"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border text-sm shrink-0">
        <span className="text-content-secondary shrink-0">From</span>
        <Select
          value={senderId}
          onValueChange={onSelect}
          disabled={sendersLoading}
        >
          <SelectTrigger className="h-8 border-none shadow-none focus:ring-0 px-1">
            <SelectValue
              placeholder={
                sendersLoading ? "Loading..." : "Select a sender identity"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {(senders ?? []).map((sender) => (
              <SelectItem key={sender.id} value={sender.id}>
                {sender.fromName
                  ? `${sender.fromName} <${sender.address}>`
                  : sender.address}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {privileged && verifiedDomains.length > 0 && (
          <button
            type="button"
            onClick={startCreating}
            className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
          >
            <Plus className="h-3 w-3" /> New address
          </button>
        )}
      </div>

      {!sendersLoading && (senders ?? []).length === 0 && (
        <div className="text-xs text-content-secondary px-3 py-2 border-b border-border">
          {privileged ? (
            verifiedDomains.length > 0 ? (
              'You don\'t have a sender identity yet - click "New address" above to create one.'
            ) : (
              <>
                No verified domain yet.{" "}
                <Link
                  to="/dashboard/organization/domains"
                  className="text-primary hover:underline"
                >
                  Set one up
                </Link>{" "}
                to create a sender address.
              </>
            )
          ) : (
            "No sender identity is assigned to you yet - ask your organization owner to assign one."
          )}
        </div>
      )}
    </>
  );
}

interface ComposeWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSent?: (threadId: string) => void;
}

/** Floating, non-blocking compose window docked to the bottom-right of the viewport - mirrors the Gmail "New Message" flow. */
export function ComposeWindow({
  open,
  onOpenChange,
  onSent,
}: ComposeWindowProps) {
  const { toast } = useToast();
  const { currentOrg } = useOrg();

  const [minimized, setMinimized] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [senderId, setSenderId] = useState("");
  const [to, setTo] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const { data: senders } = useMySenders(currentOrg?.id);
  const composeMutation = useComposeOrgThread(currentOrg?.id);

  if (!open) return null;

  const reset = () => {
    setMinimized(false);
    setExpanded(false);
    setSenderId("");
    setTo("");
    setShowCc(false);
    setCc("");
    setSubject("");
    setBody("");
  };

  const close = () => {
    onOpenChange(false);
    reset();
  };

  const isReady =
    !!senderId && !!to.trim() && !!subject.trim() && !!body.trim();

  const handleSend = () => {
    composeMutation.mutate(
      {
        senderId,
        to: to.trim(),
        cc: parseEmailList(cc),
        subject: subject.trim(),
        body,
      },
      {
        onSuccess: (thread) => {
          toast({ title: "Email sent" });
          onSent?.(thread.id);
          close();
        },
        onError: (error: any) => {
          toast({
            title: "Couldn't send email",
            description: error.response?.data?.resp_msg || error.message,
            variant: "destructive",
          });
        },
      },
    );
  };

  const selectedSender = (senders ?? []).find((s) => s.id === senderId);

  return (
    <div
      className={`fixed bottom-0 right-6 z-50 flex flex-col bg-card border border-border rounded-t-lg shadow-2xl transition-all ${
        minimized
          ? "w-72 h-11"
          : expanded
            ? "w-[600px] h-[80vh]"
            : "w-[420px] h-[480px]"
      }`}
    >
      <div
        className="flex items-center justify-between px-3 h-11 rounded-t-lg bg-primary text-primary-foreground cursor-pointer shrink-0"
        onClick={() => minimized && setMinimized(false)}
      >
        <span className="text-sm font-medium truncate">
          {subject || "New Message"}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMinimized((m) => !m);
            }}
            className="p-1 rounded hover:bg-primary-foreground/20"
            aria-label={minimized ? "Restore" : "Minimize"}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMinimized(false);
              setExpanded((x) => !x);
            }}
            className="p-1 rounded hover:bg-primary-foreground/20"
            aria-label={expanded ? "Shrink" : "Expand"}
          >
            {expanded ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            className="p-1 rounded hover:bg-primary-foreground/20"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {!minimized && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <SenderPicker
            orgId={currentOrg?.id}
            senderId={senderId}
            onSelect={setSenderId}
          />

          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border shrink-0">
            <Input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="To"
              type="email"
              className="h-8 border-none shadow-none focus-visible:ring-0 px-1"
            />
            {!showCc && (
              <button
                type="button"
                onClick={() => setShowCc(true)}
                className="text-xs text-content-secondary hover:text-content shrink-0"
              >
                Cc
              </button>
            )}
          </div>

          {showCc && (
            <div className="px-3 py-1.5 border-b border-border shrink-0">
              <Input
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="Cc: comma-separated email addresses"
                className="h-8 border-none shadow-none focus-visible:ring-0 px-1"
              />
            </div>
          )}

          <div className="px-3 py-1.5 border-b border-border shrink-0">
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="h-8 border-none shadow-none focus-visible:ring-0 px-1"
            />
          </div>

          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Compose your message..."
            className="flex-1 resize-none border-none shadow-none focus-visible:ring-0 rounded-none px-3 py-2"
          />

          <div className="flex items-center justify-between px-3 py-2 border-t border-border shrink-0">
            <Button
              onClick={handleSend}
              disabled={!isReady || composeMutation.isPending}
              size="sm"
            >
              {composeMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send
            </Button>
            {selectedSender && (
              <span className="text-xs text-content-secondary truncate max-w-[200px]">
                Sending as {selectedSender.address}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
