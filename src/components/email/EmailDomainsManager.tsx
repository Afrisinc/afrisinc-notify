import { useState } from "react";
import {
  useEmailDomains,
  useAddEmailDomain,
  useEmailDomainRecords,
  useVerifyEmailDomain,
  useDeleteEmailDomain,
  useInboundMxRecord,
  useEnableInboundDomain,
} from "@/hooks/useEmailDomains";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Globe,
  Plus,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Inbox,
  CheckCircle2,
} from "lucide-react";

interface EmailDomainsManagerProps {
  appId: string;
}

function DomainDetails({
  appId,
  domainId,
  inboundEnabled,
  mxVerified,
}: {
  appId: string;
  domainId: string;
  inboundEnabled: boolean;
  mxVerified: boolean;
}) {
  const { toast } = useToast();
  const recordsQuery = useEmailDomainRecords(appId, domainId);
  const verifyMutation = useVerifyEmailDomain(appId);
  const mxQuery = useInboundMxRecord(appId, inboundEnabled ? domainId : null);
  const enableInboundMutation = useEnableInboundDomain(appId);

  if (recordsQuery.isLoading) {
    return <Skeleton className="h-24 w-full" />;
  }

  const records = recordsQuery.data;
  if (!records) return null;

  const entries = [
    { label: "SPF", ...records.spf },
    { label: "DKIM", ...records.dkim },
    { label: "DMARC", ...records.dmarc },
  ];

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.label}
            className="border border-border/60 rounded-lg p-3 space-y-1 bg-surface/30"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{entry.label}</span>
              <Badge variant={entry.verified ? "default" : "secondary"}>
                {entry.verified ? "Verified" : "Pending"}
              </Badge>
            </div>
            <p className="text-xs text-content-secondary">Name: {entry.name}</p>
            <p className="text-xs font-mono text-content break-all">
              {entry.value}
            </p>
          </div>
        ))}
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={async () => {
          try {
            await verifyMutation.mutateAsync(domainId);
            toast({ title: "Verification checked" });
          } catch (error) {
            toast({
              title: "Error",
              description: getErrorMessage(error),
              variant: "destructive",
            });
          }
        }}
        disabled={verifyMutation.isPending}
      >
        {verifyMutation.isPending ? (
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        ) : null}
        Re-check sending DNS
      </Button>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Inbox className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold">Inbound receiving</h4>
          {inboundEnabled && mxVerified && (
            <Badge variant="default" className="ml-auto">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Active
            </Badge>
          )}
        </div>

        {!inboundEnabled ? (
          <>
            <p className="text-xs text-content-secondary">
              Enable this to receive replies to emails sent from this domain,
              viewable in your Inbox.
            </p>
            <Button
              size="sm"
              onClick={async () => {
                try {
                  await enableInboundMutation.mutateAsync(domainId);
                  toast({
                    title: "Inbound receiving enabled",
                    description: "Add the MX record shown below.",
                  });
                } catch (error) {
                  toast({
                    title: "Error",
                    description: getErrorMessage(error),
                    variant: "destructive",
                  });
                }
              }}
              disabled={enableInboundMutation.isPending}
            >
              {enableInboundMutation.isPending ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : null}
              Enable Inbound Receiving
            </Button>
          </>
        ) : (
          <div className="border border-border/60 rounded-lg p-3 space-y-1 bg-surface/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">MX Record</span>
              <Badge variant={mxVerified ? "default" : "secondary"}>
                {mxVerified ? "Verified" : "Pending"}
              </Badge>
            </div>
            <p className="text-xs text-content-secondary">
              Add an MX record pointing to:
            </p>
            <p className="text-xs font-mono text-content break-all">
              {mxQuery.data?.host ?? "loading..."}
            </p>
            {!mxVerified && (
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={async () => {
                  try {
                    await enableInboundMutation.mutateAsync(domainId);
                    toast({ title: "MX record checked" });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: getErrorMessage(error),
                      variant: "destructive",
                    });
                  }
                }}
                disabled={enableInboundMutation.isPending}
              >
                Re-check MX record
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function EmailDomainsManager({ appId }: EmailDomainsManagerProps) {
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const domainsQuery = useEmailDomains(appId);
  const addMutation = useAddEmailDomain(appId);
  const deleteMutation = useDeleteEmailDomain(appId);

  const domains = domainsQuery.data ?? [];

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    try {
      await addMutation.mutateAsync({ domain: newDomain.trim() });
      setNewDomain("");
      setShowAdd(false);
      toast({
        title: "Domain added",
        description: "Add the generated DNS records to verify it.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to add domain"),
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-border/60">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" /> Custom Domains
          </CardTitle>
          <CardDescription>
            Manage every sending/receiving domain for this app.
          </CardDescription>
        </div>
        <Button size="sm" onClick={() => setShowAdd((v) => !v)}>
          <Plus className="h-4 w-4 mr-1" /> Add Domain
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {showAdd && (
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input
              placeholder="mail.example.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              disabled={addMutation.isPending}
            />
            <Button
              type="submit"
              disabled={addMutation.isPending || !newDomain.trim()}
            >
              {addMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Add"
              )}
            </Button>
          </form>
        )}

        {domainsQuery.isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : domains.length === 0 ? (
          <p className="text-sm text-content-secondary text-center py-6">
            No custom domains yet.
          </p>
        ) : (
          domains.map((domain) => (
            <div key={domain.id} className="border border-border/60 rounded-lg">
              <button
                type="button"
                onClick={() =>
                  setExpandedId(expandedId === domain.id ? null : domain.id)
                }
                className="w-full flex items-center justify-between p-3"
              >
                <div className="flex items-center gap-2 text-left">
                  <span className="text-sm font-medium">{domain.domain}</span>
                  <Badge
                    variant={
                      domain.status === "verified" ? "default" : "secondary"
                    }
                  >
                    {domain.status}
                  </Badge>
                  {domain.inboundEnabled && (
                    <Badge variant={domain.mxVerified ? "default" : "outline"}>
                      <Inbox className="h-3 w-3 mr-1" /> Inbound
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(domain.id);
                    }}
                    className="p-1 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </span>
                  {expandedId === domain.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </button>
              {expandedId === domain.id && (
                <div className="px-3 pb-3">
                  <DomainDetails
                    appId={appId}
                    domainId={domain.id}
                    inboundEnabled={domain.inboundEnabled}
                    mxVerified={domain.mxVerified}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
