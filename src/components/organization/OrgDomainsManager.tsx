import { useState } from "react";
import {
  useOrgDomains,
  useAddOrgDomain,
  useOrgDomainRecords,
  useVerifyOrgDomain,
  useDeleteOrgDomain,
  useOrgInboundMxRecord,
  useEnableOrgInboundDomain,
  useAddOrgSender,
  useUpdateOrgSender,
  useDeleteOrgSender,
  useOrgCloudflareSettings,
} from "@/hooks/useOrgDomains";
import { useOrganizationMembers } from "@/hooks/useOrganization";
import { useOrg } from "@/contexts/OrgContext";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import { CopyButton } from "@/components/CopyButton";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Globe,
  Plus,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Inbox,
  CheckCircle2,
  User,
  UserX,
  Cloud,
} from "lucide-react";

const UNASSIGNED = "__unassigned__";

function DomainSenders({
  orgId,
  domainId,
  senders,
  domainVerified,
}: {
  orgId: string;
  domainId: string;
  senders: any[];
  domainVerified: boolean;
}) {
  const { toast } = useToast();
  const [localPart, setLocalPart] = useState("");
  const [fromName, setFromName] = useState("");
  const [assignedUserId, setAssignedUserId] = useState<string>(UNASSIGNED);

  const { data: membersResponse } = useOrganizationMembers(orgId);
  const members = membersResponse?.members ?? [];

  const addSenderMutation = useAddOrgSender(orgId);
  const updateSenderMutation = useUpdateOrgSender(orgId);
  const deleteSenderMutation = useDeleteOrgSender(orgId);

  const handleAddSender = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localPart.trim()) return;
    try {
      await addSenderMutation.mutateAsync({
        domainId,
        payload: {
          localPart: localPart.trim(),
          fromName: fromName.trim() || undefined,
          assignedUserId:
            assignedUserId === UNASSIGNED ? undefined : assignedUserId,
        },
      });
      setLocalPart("");
      setFromName("");
      setAssignedUserId(UNASSIGNED);
      toast({ title: "Sender added" });
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-3 pt-4">
      <h4 className="text-sm font-semibold">Sender identities</h4>

      {senders.length > 0 && (
        <div className="space-y-2">
          {senders.map((sender: any) => (
            <div
              key={sender.id}
              className="flex items-center justify-between border border-border/60 rounded-lg p-2.5 bg-surface/30"
            >
              <div className="min-w-0 flex items-center gap-1">
                <div className="min-w-0">
                  <p className="text-sm font-mono truncate">{sender.address}</p>
                  <p className="text-xs text-content-secondary truncate">
                    {sender.assignedUser
                      ? `Assigned to ${sender.assignedUser.firstName || sender.assignedUser.email}`
                      : "Not assigned to a specific member"}
                  </p>
                </div>
                <CopyButton value={sender.address} label="address" />
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Select
                  value={sender.assignedUserId ?? UNASSIGNED}
                  onValueChange={(value) =>
                    updateSenderMutation.mutate({
                      senderId: sender.id,
                      payload: {
                        assignedUserId: value === UNASSIGNED ? null : value,
                      },
                    })
                  }
                >
                  <SelectTrigger className="h-8 w-40 text-xs">
                    <SelectValue placeholder="Assign to..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNASSIGNED}>
                      <span className="flex items-center gap-1">
                        <UserX className="h-3 w-3" /> Unassigned
                      </span>
                    </SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.userId} value={m.userId}>
                        {m.firstName
                          ? `${m.firstName} ${m.lastName ?? ""}`.trim()
                          : m.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => deleteSenderMutation.mutate(sender.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {domainVerified ? (
        <form
          onSubmit={handleAddSender}
          className="flex flex-wrap items-end gap-2"
        >
          <Input
            placeholder="local-part (e.g. jane)"
            value={localPart}
            onChange={(e) => setLocalPart(e.target.value)}
            className="w-40"
          />
          <Input
            placeholder="From name (optional)"
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
            className="w-40"
          />
          <Select value={assignedUserId} onValueChange={setAssignedUserId}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Assign to member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNASSIGNED}>
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" /> Any owner/admin
                </span>
              </SelectItem>
              {members.map((m) => (
                <SelectItem key={m.userId} value={m.userId}>
                  {m.firstName
                    ? `${m.firstName} ${m.lastName ?? ""}`.trim()
                    : m.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="submit"
            size="sm"
            disabled={addSenderMutation.isPending || !localPart.trim()}
          >
            {addSenderMutation.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Plus className="h-3 w-3" />
            )}
          </Button>
        </form>
      ) : (
        <p className="text-xs text-content-secondary">
          Verify this domain's SPF/DKIM/DMARC records above before creating
          sender addresses under it.
        </p>
      )}
    </div>
  );
}

function OrgDomainDetails({
  orgId,
  domainId,
  inboundEnabled,
  mxVerified,
  domainVerified,
  senders,
}: {
  orgId: string;
  domainId: string;
  inboundEnabled: boolean;
  mxVerified: boolean;
  domainVerified: boolean;
  senders: any[];
}) {
  const { toast } = useToast();
  const recordsQuery = useOrgDomainRecords(orgId, domainId);
  const verifyMutation = useVerifyOrgDomain(orgId);
  const mxQuery = useOrgInboundMxRecord(
    orgId,
    inboundEnabled ? domainId : null,
  );
  const enableInboundMutation = useEnableOrgInboundDomain(orgId);

  if (recordsQuery.isLoading) return <Skeleton className="h-24 w-full" />;
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
            <div className="flex items-center gap-1">
              <p className="text-xs text-content-secondary truncate">
                Name: {entry.name}
              </p>
              <CopyButton value={entry.name} label="record name" />
            </div>
            <div className="flex items-start gap-1">
              <p className="text-xs font-mono text-content break-all flex-1">
                {entry.value}
              </p>
              <CopyButton value={entry.value} label="record value" />
            </div>
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
        ) : (
          <div className="border border-border/60 rounded-lg p-3 space-y-1 bg-surface/30">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">MX Record</span>
              <Badge variant={mxVerified ? "default" : "secondary"}>
                {mxVerified ? "Verified" : "Pending"}
              </Badge>
            </div>
            <div className="flex items-start gap-1">
              <p className="text-xs font-mono text-content break-all flex-1">
                {mxQuery.data?.host ?? "loading..."}
              </p>
              {mxQuery.data?.host && (
                <CopyButton value={mxQuery.data.host} label="MX record" />
              )}
            </div>
          </div>
        )}
      </div>

      <Separator />

      <DomainSenders
        orgId={orgId}
        domainId={domainId}
        senders={senders}
        domainVerified={domainVerified}
      />
    </div>
  );
}

export function OrgDomainsManager() {
  const { toast } = useToast();
  const { currentOrg } = useOrg();
  const isOwner = currentOrg?.userRole === "OWNER";
  const orgId = currentOrg?.id;

  const [showAdd, setShowAdd] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [showCloudflare, setShowCloudflare] = useState(false);
  const [cloudflareApiToken, setCloudflareApiToken] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const domainsQuery = useOrgDomains(orgId);
  const addMutation = useAddOrgDomain(orgId);
  const deleteMutation = useDeleteOrgDomain(orgId);
  const { data: cloudflareSettings } = useOrgCloudflareSettings(orgId);
  const hasOrgCloudflareDefault = !!cloudflareSettings?.connected;

  const domains = domainsQuery.data ?? [];

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    try {
      const result = await addMutation.mutateAsync({
        domain: newDomain.trim(),
        cloudflareApiToken: cloudflareApiToken.trim() || undefined,
      });
      setNewDomain("");
      setCloudflareApiToken("");
      setShowCloudflare(false);
      setShowAdd(false);

      if (result.cloudflare?.success) {
        toast({
          title: "Connected to Cloudflare",
          description: [
            result.domain.status === "verified"
              ? "DNS records were added and verified automatically."
              : "DNS records were added via Cloudflare - verification is still finishing up.",
            result.usedOrgDefault
              ? "Used your organization's default Cloudflare token."
              : "",
          ]
            .filter(Boolean)
            .join(" "),
        });
      } else if (result.cloudflare && !result.cloudflare.success) {
        toast({
          title: "Domain added, but Cloudflare setup failed",
          description:
            result.cloudflare.error ||
            "Add the DNS records shown below manually instead.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Domain added",
          description: "Add the generated DNS records to verify it.",
        });
      }
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
            <Globe className="h-4 w-4" /> Organization Domains
          </CardTitle>
          <CardDescription>
            {isOwner
              ? "Register custom domains and assign sender identities to your team."
              : "Domains and sender identities managed by your organization owner."}
          </CardDescription>
        </div>
        {isOwner && (
          <Button size="sm" onClick={() => setShowAdd((v) => !v)}>
            <Plus className="h-4 w-4 mr-1" /> Add Domain
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {!isOwner && domains.length === 0 && !domainsQuery.isLoading && (
          <p className="text-sm text-content-secondary text-center py-6">
            Only the organization owner can register domains.
          </p>
        )}

        {isOwner && showAdd && (
          <form onSubmit={handleAdd} className="space-y-2">
            <div className="flex gap-2">
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
            </div>

            {hasOrgCloudflareDefault && !showCloudflare && (
              <p className="flex items-center gap-1 text-xs text-content-secondary">
                <Cloud className="h-3 w-3" /> Your organization's default
                Cloudflare token will be used automatically.
              </p>
            )}

            {showCloudflare ? (
              <div className="flex gap-2 items-start">
                <div className="flex-1 space-y-1">
                  <Input
                    type="password"
                    placeholder="Cloudflare API token (Zone:DNS:Edit)"
                    value={cloudflareApiToken}
                    onChange={(e) => setCloudflareApiToken(e.target.value)}
                    disabled={addMutation.isPending}
                  />
                  <p className="text-xs text-content-secondary">
                    Adds and verifies the SPF/DKIM/DMARC records automatically
                    instead of copying them by hand. The domain must already be
                    on Cloudflare, and the token needs Zone / DNS / Edit
                    permission for it.
                    {hasOrgCloudflareDefault &&
                      " Leave blank to use your organization's default token instead."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowCloudflare(false);
                    setCloudflareApiToken("");
                  }}
                  className="text-xs text-content-secondary hover:text-content shrink-0 mt-2"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowCloudflare(true)}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Cloud className="h-3 w-3" />{" "}
                {hasOrgCloudflareDefault
                  ? "Use a different Cloudflare token for this domain"
                  : "Connect via Cloudflare to skip manual DNS setup"}
              </button>
            )}
          </form>
        )}

        {domainsQuery.isLoading ? (
          <Skeleton className="h-16 w-full" />
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
                  <span className="text-xs text-content-secondary">
                    {domain.senders.length} sender
                    {domain.senders.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isOwner && (
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
                  )}
                  {expandedId === domain.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </button>
              {expandedId === domain.id && orgId && (
                <div className="px-3 pb-3">
                  <OrgDomainDetails
                    orgId={orgId}
                    domainId={domain.id}
                    inboundEnabled={domain.inboundEnabled}
                    mxVerified={domain.mxVerified}
                    domainVerified={domain.status === "verified"}
                    senders={domain.senders}
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
