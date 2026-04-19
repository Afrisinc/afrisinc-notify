import React, { useState, useEffect } from "react";
import {
  useCreateDomain,
  useGetDomainRecords,
  useVerifyDomain,
  useDeleteDomain,
} from "@/hooks/useAppSettings";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DnsRecordRow } from "./DnsRecordRow";
import { Mail, Plus, ArrowLeft, Check, AlertCircle, Loader, Trash2, Edit2 } from "lucide-react";
import { type DomainDNSRecord, type CustomDomain } from "@/services/appSettings";

type Step = "list" | "form" | "dns" | "verified";

interface EmailDomainSectionProps {
  appId: string;
}

export function EmailDomainSection({ appId }: EmailDomainSectionProps) {
  const { toast } = useToast();
  const { copy, isCopied } = useCopyToClipboard();

  // Mutations
  const createDomainMutation = useCreateDomain();
  const verifyDomainMutation = useVerifyDomain();
  const deleteDomainMutation = useDeleteDomain();

  // Local state
  const [step, setStep] = useState<Step>("list");
  const [domain, setDomain] = useState("");
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [domainId, setDomainId] = useState<string | null>(null);
  const [currentDomain, setCurrentDomain] = useState<CustomDomain | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  // Fetch domain records if domainId exists
  const { data: domainData, isLoading: domainLoading } = useGetDomainRecords(appId, domainId || "", {
    enabled: !!domainId,
  });

  // Update current domain when data loads
  useEffect(() => {
    if (domainData) {
      setCurrentDomain(domainData);
      setDomain(domainData.domain);
      setFromName(domainData.fromName);
      setFromEmail(domainData.fromEmail);
    }
  }, [domainData]);

  const handleCreateDomain = async () => {
    if (!fromEmail.trim()) {
      toast({
        title: "Error",
        description: "From Email is required",
        variant: "destructive",
      });
      return;
    }

    if (!domain.trim()) {
      toast({
        title: "Error",
        description: "Domain is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createDomainMutation.mutateAsync({
        appId,
        payload: {
          domain: domain.trim(),
          fromName: fromName.trim() || "Notify",
          fromEmail: fromEmail.trim(),
        },
      });

      setDomainId(result.id);
      setCurrentDomain(result);
      setStep("dns");
      toast({
        title: "Success",
        description: "Domain created. Now verify your DNS records.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleVerifyDomain = async () => {
    if (!domainId) return;

    try {
      const result = await verifyDomainMutation.mutateAsync({
        appId,
        domainId,
      });

      // Check if all records are verified
      const allVerified = result.checks.spf && result.checks.dkim && result.checks.dmarc;

      if (allVerified && currentDomain) {
        setStep("verified");
        toast({
          title: "Success",
          description: "All DNS records verified! Your domain is ready to use.",
        });
      } else {
        toast({
          title: "Verification Status",
          description: "DNS records checked. Some records may still be pending.",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveDomain = async () => {
    if (!domainId) return;

    try {
      await deleteDomainMutation.mutateAsync({ appId, domainId });
      setShowRemoveConfirm(false);
      setStep("list");
      setDomainId(null);
      setCurrentDomain(null);
      setDomain("");
      setFromName("");
      setFromEmail("");
      toast({
        title: "Success",
        description: "Domain removed successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const getRecordStatus = (recordId: string): "verified" | "pending" | "error" | "optional" => {
    if (!currentDomain) return "pending";

    const verified = currentDomain.verified;
    if (recordId === "spf") return verified.spf ? "verified" : "pending";
    if (recordId === "dkim") return verified.dkim ? "verified" : "pending";
    if (recordId === "dmarc") return verified.dmarc ? "verified" : "pending";

    return "pending";
  };

  // Loading state
  if (domainLoading && domainId) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4" /> Email Sending Domain
          </CardTitle>
          <CardDescription>Configure your custom email sender address.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Screen 1: List (empty state)
  if (step === "list") {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4" /> Email Sending Domain
          </CardTitle>
          <CardDescription>Configure your custom email sender address with DKIM verification.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <Mail className="h-12 w-12 icon-muted mx-auto" />
            <div>
              <h3 className="text-sm font-medium text-content mb-1">No custom domain connected yet</h3>
              <p className="text-sm text-content-secondary">Emails send from notify@afrisinc.com by default.</p>
            </div>
            <Button onClick={() => setStep("form")}>
              <Plus className="h-4 w-4 mr-2" /> Connect Your Domain
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Screen 2: Form
  if (step === "form") {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={() => setStep("list")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-base">Connect Custom Domain</CardTitle>
              <CardDescription>Set up your custom email sender with DKIM support.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Domain *</Label>
            <Input
              placeholder="mail.yourdomain.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs font-medium mb-1 block">From Name</Label>
            <Input
              placeholder="e.g., Acme Payments"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs font-medium mb-1 block">
              From Email <span className="text-danger">*</span>
            </Label>
            <Input
              placeholder="no-reply@yourdomain.com"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
            />
          </div>

          <Button
            onClick={handleCreateDomain}
            disabled={createDomainMutation.isPending || !fromEmail.trim() || !domain.trim()}
            className="w-full"
          >
            {createDomainMutation.isPending ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Generate DNS Records"
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Screen 3: DNS Records & Verification
  if ((step === "dns" || step === "verified") && currentDomain) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email Sending Domain
              </CardTitle>
              <CardDescription className="mt-1">{currentDomain.domain}</CardDescription>
            </div>
            <Badge variant={step === "verified" ? "default" : "secondary"}>
              {step === "verified" ? "Verified" : currentDomain.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === "verified" && (
            <Alert className="bg-success/10 border-success/30">
              <Check className="h-4 w-4 text-success" />
              <AlertDescription className="text-success">
                ✅ Domain verified! All emails will send as{" "}
                <span className="font-medium">
                  {fromName && `${fromName} <${fromEmail}>`}
                  {!fromName && fromEmail}
                </span>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-content">Add these DNS records</h3>
                <p className="text-xs text-content-secondary mt-1">
                  Copy each record below and add to your DNS provider. Changes take 5–30 minutes to propagate.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {currentDomain.dnsRecords.map((record: DomainDNSRecord) => (
                <DnsRecordRow
                  key={record.label}
                  id={record.label.toLowerCase()}
                  label={record.label}
                  type={record.type}
                  name={record.name}
                  value={record.value}
                  status={getRecordStatus(record.label.toLowerCase())}
                  onCopy={copy}
                  isCopied={isCopied(record.label.toLowerCase())}
                />
              ))}
            </div>
          </div>

          {step === "dns" && (
            <>
              <Separator />
              <Button
                onClick={handleVerifyDomain}
                disabled={verifyDomainMutation.isPending}
                variant="outline"
                className="w-full"
              >
                {verifyDomainMutation.isPending ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Check Verification"
                )}
              </Button>
            </>
          )}

          <Separator />

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setStep("form")}>
              <Edit2 className="h-3.5 w-3.5 mr-1.5" /> Edit
            </Button>
            <AlertDialog open={showRemoveConfirm} onOpenChange={setShowRemoveConfirm}>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Remove Domain
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove Custom Domain?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will stop using {currentDomain.domain} for email. Emails will revert to notify@afrisinc.com.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRemoveDomain}
                    disabled={deleteDomainMutation.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteDomainMutation.isPending ? "Removing..." : "Remove"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
