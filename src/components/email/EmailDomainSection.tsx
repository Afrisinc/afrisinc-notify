import React, { useState } from "react";
import {
  useCreateDomain,
  useGetDomainRecords,
  useVerifyDomain,
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
import { Mail, Plus, ArrowLeft, Loader, Copy } from "lucide-react";

interface EmailDomainSectionProps {
  appId: string;
}

type Step = "list" | "form" | "dns" | "verified";

export function EmailDomainSection({ appId }: EmailDomainSectionProps) {
  const { toast } = useToast();
  const { copy } = useCopyToClipboard();

  // Hooks for API calls
  const createDomainMutation = useCreateDomain();
  const getDomainRecordsQuery = useGetDomainRecords(appId);
  const verifyDomainMutation = useVerifyDomain();

  // Local state
  const [step, setStep] = useState<Step>("list");
  const [domain, setDomain] = useState("");

  // Determine initial step based on data
  const hasDomainRecords = getDomainRecordsQuery.data?.domain;

  const handleCreateDomain = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!domain.trim()) {
      toast({
        title: "Error",
        description: "Domain name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await createDomainMutation.mutateAsync({
        appId,
        payload: { domain: domain.trim() },
      });

      setStep("dns");
      toast({
        title: "Success",
        description: "Domain configured successfully. Please verify DNS records.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create domain",
        variant: "destructive",
      });
    }
  };

  const handleVerifyDomain = async () => {
    try {
      const result = await verifyDomainMutation.mutateAsync({ appId });

      const allVerified = result.spfVerified && result.dkimVerified && result.dmarcVerified;

      if (allVerified) {
        setStep("verified");
        toast({
          title: "Success",
          description: "All DNS records verified! Your domain is ready to use.",
        });
      } else {
        toast({
          title: "Verification Status Updated",
          description: "Check the status of your DNS records below.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to verify domain",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (getDomainRecordsQuery.isLoading) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4" /> Custom Domain
          </CardTitle>
          <CardDescription>Configure your custom domain for email sending.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!hasDomainRecords && step === "list") {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4" /> Custom Domain
          </CardTitle>
          <CardDescription>Configure your custom domain for email sending.</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="space-y-4">
            <Mail className="h-12 w-12 icon-muted mx-auto" />
            <div>
              <h3 className="text-sm font-medium text-content mb-1">No custom domain configured</h3>
              <p className="text-sm text-content-secondary mb-4">Set up your custom domain to send emails with your own domain.</p>
            </div>
            <Button onClick={() => setStep("form")}>
              <Plus className="h-4 w-4 mr-2" /> Configure Domain
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Form state
  if (step === "form") {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(hasDomainRecords ? "dns" : "list")}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <CardTitle className="text-base">Configure Custom Domain</CardTitle>
              <CardDescription>Enter your domain details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateDomain} className="space-y-4">
            <div>
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                type="text"
                placeholder="mail.example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                disabled={createDomainMutation.isPending}
              />
            </div>

            <Separator />

            <Button
              type="submit"
              disabled={createDomainMutation.isPending || !domain.trim()}
              className="w-full"
            >
              {createDomainMutation.isPending ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate DNS Records"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(hasDomainRecords ? "dns" : "list")}
              className="w-full"
              disabled={createDomainMutation.isPending}
            >
              Cancel
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // DNS verification state
  if (step === "dns" && getDomainRecordsQuery.data) {
    const records = getDomainRecordsQuery.data;
    const dnsRecords = [
      records.spf && { ...records.spf, type: "SPF", id: "spf" },
      records.dkim && { ...records.dkim, type: "DKIM", id: "dkim" },
      records.dmarc && { ...records.dmarc, type: "DMARC", id: "dmarc" },
    ].filter(Boolean);

    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4" /> Custom Domain Setup
          </CardTitle>
          <CardDescription>Verify your DNS records</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-content mb-2">Domain: {records.domain}</h4>
            <p className="text-xs text-content-secondary mb-4">
              Add these DNS records to your domain registrar to complete the setup.
            </p>
          </div>

          <div className="space-y-3">
            {dnsRecords.map((record: any) => (
              <div key={record.id} className="border border-border/60 rounded-lg p-3 space-y-2 bg-surface/30">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-content">Type: {record.type}</p>
                    <p className="text-xs text-content-secondary">Name: {record.name}</p>
                  </div>
                  <Badge variant={record.verified ? "default" : "secondary"}>
                    {record.verified ? "Verified" : "Pending"}
                  </Badge>
                </div>
                <div className="bg-surface/60 rounded p-2 text-xs font-mono text-content break-all max-h-20 overflow-y-auto">
                  {record.value}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    copy(record.value, `record-${record.id}`);
                    toast({
                      title: "Copied",
                      description: "DNS record copied to clipboard",
                    });
                  }}
                >
                  <Copy className="h-3 w-3 mr-1" /> Copy
                </Button>
              </div>
            ))}
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-blue-800">
              DNS changes can take 5-30 minutes to propagate. Click "Check Verification" once you've added the records.
            </AlertDescription>
          </Alert>

          <Separator />

          <Button
            onClick={handleVerifyDomain}
            disabled={verifyDomainMutation.isPending}
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

          <Button
            variant="outline"
            onClick={() => setStep("form")}
            className="w-full"
          >
            Edit
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Verified state
  if (step === "verified" && getDomainRecordsQuery.data) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4" /> ✅ Custom Domain Verified
          </CardTitle>
          <CardDescription>Your domain is ready to use</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-surface rounded-lg border border-border/60 p-4 space-y-2">
            <p className="text-xs font-semibold text-content-secondary uppercase tracking-wide">Active Domain</p>
            <p className="text-2xl font-bold text-content break-all">
              {getDomainRecordsQuery.data.domain}
            </p>
            <p className="text-sm text-content-secondary">
              All DNS records verified. Emails will be sent from this domain.
            </p>
          </div>

          <Alert className="bg-surface/60 border-border/60">
            <AlertDescription className="text-content-secondary text-xs">
              <strong className="text-content">SPF:</strong> ✅ Verified | <strong className="text-content">DKIM:</strong> ✅ Verified | <strong className="text-content">DMARC:</strong> ✅ Verified
            </AlertDescription>
          </Alert>

          <Separator />

          <Button
            variant="outline"
            onClick={() => setStep("form")}
            className="w-full"
          >
            Edit Domain
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
