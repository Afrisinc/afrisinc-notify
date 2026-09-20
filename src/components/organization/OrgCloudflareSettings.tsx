import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import {
  useOrgCloudflareSettings,
  useUpdateOrgCloudflareSettings,
  useDeleteOrgCloudflareSettings,
} from "@/hooks/useOrgDomains";
import { Cloud, CheckCircle2, Loader2 } from "lucide-react";

/**
 * Org-wide default Cloudflare API token. Any domain added under this
 * organization (OrgDomainsManager) without its own per-domain token falls
 * back to this one, so owners only have to paste it once instead of on
 * every "Add Domain" call.
 */
export function OrgCloudflareSettings({
  orgId,
  isOwner,
}: {
  orgId: string;
  isOwner: boolean;
}) {
  const { toast } = useToast();
  const [token, setToken] = useState("");

  const { data: settings, isLoading } = useOrgCloudflareSettings(orgId);
  const updateMutation = useUpdateOrgCloudflareSettings(orgId);
  const deleteMutation = useDeleteOrgCloudflareSettings(orgId);

  const connected = !!settings?.connected;

  const handleSave = async () => {
    if (!token.trim()) {
      toast({
        title: "Error",
        description: "Enter a Cloudflare API token",
        variant: "destructive",
      });
      return;
    }
    try {
      await updateMutation.mutateAsync(token.trim());
      setToken("");
      toast({
        title: "Success",
        description: "Cloudflare token saved for this organization",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleRemove = async () => {
    try {
      await deleteMutation.mutateAsync();
      toast({ title: "Success", description: "Cloudflare token removed" });
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Cloud className="h-4 w-4 text-primary" /> Cloudflare
          {connected && (
            <Badge variant="default" className="ml-auto">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Connected
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Set a default Cloudflare API token for this organization. Any custom
          domain added under it will use this token automatically to configure
          DNS, unless a different token is supplied for that domain.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isOwner ? (
          <p className="text-sm text-content-secondary">
            Only the organization owner can manage this setting.
          </p>
        ) : isLoading ? (
          <p className="text-sm text-content-secondary">Loading...</p>
        ) : (
          <>
            <div>
              <Label className="text-xs font-medium mb-1 block">
                {connected ? "Replace API Token" : "Cloudflare API Token"}
              </Label>
              <Input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Cloudflare API token (Zone:DNS:Edit)"
                disabled={updateMutation.isPending}
              />
              <p className="text-xs text-content-secondary mt-1">
                Needs Zone / DNS / Edit permission for the domains you plan to
                add. Stored encrypted, never shown again.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending || !token.trim()}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : connected ? (
                  "Replace Token"
                ) : (
                  "Save Token"
                )}
              </Button>
              {connected && (
                <Button
                  variant="outline"
                  onClick={handleRemove}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Remove"
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
