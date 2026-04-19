import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCampaigns, useCreateCampaign, useUpdateCampaign, useDeleteCampaign, useSendCampaign, useScheduleCampaign, useDuplicateCampaign } from "@/hooks/useCampaigns";
import { useAppTemplates } from "@/hooks/useApps";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Megaphone, Send, Clock, CheckCircle2, XCircle, AlertCircle, ChevronRight, ChevronLeft, Trash2, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SearchInput } from "@/components/ui/search-input";

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  draft: { icon: AlertCircle, color: "text-muted-foreground" },
  scheduled: { icon: Clock, color: "text-warning" },
  sending: { icon: Send, color: "text-primary" },
  completed: { icon: CheckCircle2, color: "text-success" },
  failed: { icon: XCircle, color: "text-destructive" },
};

export default function AppCampaigns() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newCampaignData, setNewCampaignData] = useState({
    name: "",
    channel: "email" as const,
    templateId: "",
    recipientType: "all" as const,
    recipientCount: 0,
  });

  // Fetch data
  const { data: campaignsResponse, isLoading, error } = useCampaigns(appId || "", { page: 1, limit: 100 });
  const { data: templatesResponse } = useAppTemplates(appId || "");

  const campaigns = campaignsResponse?.campaigns || [];
  const templates = templatesResponse?.templates || [];

  // Mutations
  const createMutation = useCreateCampaign();
  const updateMutation = useUpdateCampaign();
  const deleteMutation = useDeleteCampaign();
  const sendMutation = useSendCampaign();
  const scheduleMutation = useScheduleCampaign();
  const duplicateMutation = useDuplicateCampaign();

  const filtered = campaigns.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateCampaign = async () => {
    if (!appId || !newCampaignData.name || !newCampaignData.templateId) return;

    try {
      await createMutation.mutateAsync({
        appId,
        payload: {
          name: newCampaignData.name,
          channel: newCampaignData.channel,
          templateId: newCampaignData.templateId,
          recipientType: newCampaignData.recipientType,
          recipientCount: newCampaignData.recipientCount,
          status: "draft",
        },
      });
      setNewCampaignData({
        name: "",
        channel: "email",
        templateId: "",
        recipientType: "all",
        recipientCount: 0,
      });
      setShowCreate(false);
      setStep(1);
    } catch (err) {
      console.error("Failed to create campaign:", err);
    }
  };

  const handleDeleteCampaign = async () => {
    if (!appId || !selectedCampaignId) return;

    try {
      await deleteMutation.mutateAsync({
        appId,
        campaignId: selectedCampaignId,
      });
      setShowDeleteConfirm(false);
      setSelectedCampaignId(null);
    } catch (err) {
      console.error("Failed to delete campaign:", err);
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    if (!appId) return;

    try {
      await sendMutation.mutateAsync({
        appId,
        campaignId,
        payload: { dryRun: false },
      });
    } catch (err) {
      console.error("Failed to send campaign:", err);
    }
  };

  const handleDuplicateCampaign = async (campaignId: string) => {
    if (!appId) return;
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    try {
      await duplicateMutation.mutateAsync({
        appId,
        campaignId,
        newName: `${campaign.name} (Copy)`,
      });
    } catch (err) {
      console.error("Failed to duplicate campaign:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load campaigns. Please try again.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search campaigns..."
          size="sm"
          className="flex-1 max-w-sm"
        />
        <Button size="sm" onClick={() => { setStep(1); setShowCreate(true); }}>
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Create Campaign
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 text-center">
            <Megaphone className="h-10 w-10 icon-muted mx-auto mb-3" />
            <p className="text-sm text-content-secondary">No campaigns yet. Create one to start sending bulk notifications.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((camp) => {
            const cfg = statusConfig[camp.status];
            const Icon = cfg.icon;
            const tpl = templates.find((t) => t.template?.id === camp.templateId || t.id === camp.templateId);
            return (
              <Card key={camp.id} className="border-border/60 hover:border-border transition-colors">
                <CardContent className="flex items-center justify-between py-4 px-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center bg-muted ${cfg.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-content truncate block">{camp.name}</span>
                      <span className="text-xs text-content-secondary">
                        {tpl?.name || "Unknown template"} · {camp.recipientCount} recipients
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="secondary" className="text-[10px]">{camp.channel}</Badge>
                    <Badge variant="outline" className={`text-[10px] ${cfg.color}`}>{camp.status}</Badge>
                    {camp.status === "completed" && (
                      <span className="text-xs text-content-secondary">
                        {camp.deliveredCount}/{camp.sentCount} delivered
                      </span>
                    )}
                    {camp.scheduledAt && (
                      <span className="text-xs text-content-secondary">
                        {new Date(camp.scheduledAt).toLocaleDateString()}
                      </span>
                    )}
                    {camp.status === "completed" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/apps/${appId}/campaigns/${camp.id}/analytics`);
                        }}
                      >
                        <BarChart3 className="h-3.5 w-3.5 text-primary" />
                      </Button>
                    )}
                    {camp.status === "draft" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendCampaign(camp.id);
                        }}
                        disabled={sendMutation.isPending}
                      >
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {camp.status !== "completed" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateCampaign(camp.id);
                        }}
                        disabled={duplicateMutation.isPending}
                      >
                        📋
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCampaignId(camp.id);
                        setShowDeleteConfirm(true);
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Campaign Builder Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Create Campaign — Step {step} of 4
            </DialogTitle>
          </DialogHeader>

          {/* Step indicator */}
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label>Campaign Name *</Label>
                <Input
                  placeholder="e.g. Welcome Series"
                  value={newCampaignData.name}
                  onChange={(e) => setNewCampaignData({ ...newCampaignData, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Channel *</Label>
                <Select
                  value={newCampaignData.channel}
                  onValueChange={(v) =>
                    setNewCampaignData({ ...newCampaignData, channel: v as "email" | "sms" | "push" | "in_app" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="push">Push Notification</SelectItem>
                    <SelectItem value="in_app">In-App</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Label>Select Template *</Label>
              {templates.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No templates available. Create one first.</p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {templates.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        const templateId = t.template?.id || t.id;
                        setNewCampaignData({ ...newCampaignData, templateId });
                      }}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        newCampaignData.templateId === t.template?.id || newCampaignData.templateId === t.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium block truncate">{t.template?.code || t.code || "Unknown"}</span>
                        <span className="text-xs text-muted-foreground">{t.template?.channel || "—"}</span>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {t.status || "active"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Label>Select Recipients *</Label>
              <Select
                value={newCampaignData.recipientType}
                onValueChange={(v) =>
                  setNewCampaignData({ ...newCampaignData, recipientType: v as "all" | "tags" | "segment" | "custom" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contacts</SelectItem>
                  <SelectItem value="tags">Specific Tags</SelectItem>
                  <SelectItem value="segment">Segment</SelectItem>
                  <SelectItem value="custom">Custom List</SelectItem>
                </SelectContent>
              </Select>
              <div>
                <Label>Recipient Count (estimated)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newCampaignData.recipientCount}
                  onChange={(e) => setNewCampaignData({ ...newCampaignData, recipientCount: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Campaign will be created as a draft. You can send it immediately or schedule it for later.
              </p>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm font-medium">Campaign Summary</p>
                <div className="text-xs text-muted-foreground space-y-1 mt-2">
                  <p>Name: <span className="text-foreground">{newCampaignData.name || "—"}</span></p>
                  <p>Channel: <span className="text-foreground">{newCampaignData.channel}</span></p>
                  <p>Recipients: <span className="text-foreground">{newCampaignData.recipientCount} contacts ({newCampaignData.recipientType})</span></p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <div>
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} disabled={createMutation.isPending}>
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {step < 4 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 && (!newCampaignData.name || !newCampaignData.channel)) ||
                    (step === 2 && !newCampaignData.templateId)
                  }
                >
                  Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleCreateCampaign} disabled={createMutation.isPending}>
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  {createMutation.isPending ? "Creating..." : "Create Campaign"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Campaign?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. The campaign and all its data will be permanently deleted.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCampaign}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
