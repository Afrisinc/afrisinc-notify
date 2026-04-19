import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useAppSettings,
  useUpdateAppSettings,
  useUpdateAllowedDomains,
  useWebhooks,
  useCreateWebhook,
  useDeleteWebhook,
  useTestWebhook,
  useDeleteApp,
} from "@/hooks/useAppSettings";
import { EmailProviderSection } from "@/components/email/EmailProviderSection";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Separator } from "@/components/ui/separator";
import { Settings, Trash2, Globe, Webhook, AlertCircle, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function AppSettings() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    environment: "development" as const,
  });
  const [domainsText, setDomainsText] = useState("");
  const [webhookForm, setWebhookForm] = useState({
    url: "",
    events: [] as string[],
  });

  // Fetch data
  const { data: settings, isLoading, error } = useAppSettings(appId || "");
  const { data: webhooksResponse } = useWebhooks(appId || "");

  // Mutations
  const updateSettingsMutation = useUpdateAppSettings();
  const updateDomainsMutation = useUpdateAllowedDomains();
  const createWebhookMutation = useCreateWebhook();
  const deleteWebhookMutation = useDeleteWebhook();
  const testWebhookMutation = useTestWebhook();
  const deleteAppMutation = useDeleteApp();

  // Initialize form when settings load
  React.useEffect(() => {
    if (settings) {
      setFormData({
        name: settings.name,
        description: settings.description || "",
        environment: settings.environment,
      });
      setDomainsText(settings.allowedDomains.join("\n"));
    }
  }, [settings]);

  const handleUpdateSettings = async () => {
    if (!appId) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await updateSettingsMutation.mutateAsync({
        appId,
        payload: {
          name: formData.name,
          description: formData.description || undefined,
          environment: formData.environment,
        },
      });
      setSuccessMessage("Settings updated successfully");
    } catch (err) {
      setErrorMessage((err as Error).message);
    }
  };

  const handleUpdateDomains = async () => {
    if (!appId) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const domains = domainsText
        .split("\n")
        .map((d) => d.trim())
        .filter((d) => d.length > 0);

      await updateDomainsMutation.mutateAsync({
        appId,
        payload: { allowedDomains: domains },
      });
      setSuccessMessage("Domains updated successfully");
    } catch (err) {
      setErrorMessage((err as Error).message);
    }
  };

  const handleCreateWebhook = async () => {
    if (!appId || !webhookForm.url || webhookForm.events.length === 0) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await createWebhookMutation.mutateAsync({
        appId,
        payload: {
          url: webhookForm.url,
          events: webhookForm.events,
          isActive: true,
        },
      });
      setWebhookForm({ url: "", events: [] });
      setSuccessMessage("Webhook created successfully");
    } catch (err) {
      setErrorMessage((err as Error).message);
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!appId) return;

    try {
      await deleteWebhookMutation.mutateAsync({ appId, webhookId });
      setSuccessMessage("Webhook deleted successfully");
    } catch (err) {
      setErrorMessage((err as Error).message);
    }
  };

  const handleTestWebhook = async (webhookId: string) => {
    if (!appId) return;

    try {
      const result = await testWebhookMutation.mutateAsync({
        appId,
        webhookId,
        event: "notification.delivered",
      });
      setSuccessMessage(`Webhook test successful (${result.statusCode})`);
    } catch (err) {
      setErrorMessage(`Webhook test failed: ${(err as Error).message}`);
    }
  };

  const handleDeleteApp = async () => {
    if (!appId) return;

    try {
      await deleteAppMutation.mutateAsync(appId);
      navigate("/dashboard/apps");
    } catch (err) {
      setErrorMessage((err as Error).message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-24" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !settings) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load app settings. Please try again.</AlertDescription>
      </Alert>
    );
  }

  const webhooks = webhooksResponse?.webhooks || [];

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Alerts */}
      {successMessage && (
        <Alert className="bg-success/10 border-success/30">
          <Check className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">{successMessage}</AlertDescription>
        </Alert>
      )}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* General */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" /> General
          </CardTitle>
          <CardDescription>Manage your app's basic settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>App Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <Label>Environment</Label>
            <Select
              value={formData.environment}
              onValueChange={(v) => setFormData({ ...formData, environment: v as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="production">Production</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleUpdateSettings} disabled={updateSettingsMutation.isPending}>
            {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Allowed Domains */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" /> Allowed Domains
          </CardTitle>
          <CardDescription>Restrict API access to specific domains.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="https://example.com&#10;https://app.example.com"
            rows={3}
            value={domainsText}
            onChange={(e) => setDomainsText(e.target.value)}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleUpdateDomains}
            disabled={updateDomainsMutation.isPending}
          >
            {updateDomainsMutation.isPending ? "Saving..." : "Save Domains"}
          </Button>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Webhook className="h-4 w-4" /> Webhooks
          </CardTitle>
          <CardDescription>Configure webhook endpoints for delivery events and contact form submissions (e.g., Slack/Teams alerts).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Webhooks */}
          {webhooks.length > 0 && (
            <div className="space-y-3 mb-6">
              <p className="text-sm font-semibold">Configured Webhooks:</p>
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="p-3 border border-border/60 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{webhook.url}</p>
                      <p className="text-xs text-content-secondary">
                        {webhook.events.length} events • {webhook.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                    <Badge variant={webhook.isActive ? "default" : "secondary"}>
                      {webhook.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestWebhook(webhook.id)}
                      disabled={testWebhookMutation.isPending}
                    >
                      {testWebhookMutation.isPending ? "Testing..." : "Test"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteWebhook(webhook.id)}
                      disabled={deleteWebhookMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Separator />

          {/* New Webhook Form */}
          <div className="space-y-3 pt-3">
            <p className="text-sm font-semibold">Add New Webhook:</p>
            <div>
              <Label>Webhook URL</Label>
              <Input
                placeholder="https://your-app.com/webhooks/notify"
                value={webhookForm.url}
                onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
              />
            </div>
            <div>
              <Label>Events</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  { name: "contact.created", label: "New Contact (Contact Form)" },
                  { name: "notification.delivered", label: "Email Delivered" },
                  { name: "notification.failed", label: "Email Failed" },
                  { name: "notification.bounced", label: "Email Bounced" },
                  { name: "notification.opened", label: "Email Opened" },
                  { name: "notification.clicked", label: "Link Clicked" },
                  { name: "campaign.sent", label: "Campaign Sent" },
                ].map((event) => (
                  <label key={event.name} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={webhookForm.events.includes(event.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setWebhookForm({
                            ...webhookForm,
                            events: [...webhookForm.events, event.name],
                          });
                        } else {
                          setWebhookForm({
                            ...webhookForm,
                            events: webhookForm.events.filter((ev) => ev !== event.name),
                          });
                        }
                      }}
                      className="rounded"
                    />
                    {event.label}
                  </label>
                ))}
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleCreateWebhook}
              disabled={createWebhookMutation.isPending || !webhookForm.url || webhookForm.events.length === 0}
            >
              {createWebhookMutation.isPending ? "Creating..." : "Add Webhook"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Provider Configuration */}
      <EmailProviderSection appId={appId!} />

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-base text-destructive flex items-center gap-2">
            <Trash2 className="h-4 w-4" /> Danger Zone
          </CardTitle>
          <CardDescription>Permanently delete this app and all associated data.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">Delete App</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{settings.name}"?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the app and all its templates, contacts, campaigns, API keys, and logs.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleDeleteApp}
                  disabled={deleteAppMutation.isPending}
                >
                  {deleteAppMutation.isPending ? "Deleting..." : "Delete App"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}

// Add React import
import React from "react";
