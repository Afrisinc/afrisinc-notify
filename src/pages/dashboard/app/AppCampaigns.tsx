import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useCampaigns,
  useCreateCampaign,
  useDeleteCampaign,
  useSendCampaign,
  useScheduleCampaign,
  useDuplicateCampaign,
} from "@/hooks/useCampaigns";
import { useAppTemplates } from "@/hooks/useApps";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SearchInput } from "@/components/ui/search-input";
import { ChannelBadge, ChannelIconBox } from "@/components/ui/ChannelBadge";
import {
  Plus,
  Megaphone,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Trash2,
  BarChart3,
  Copy,
  Mail,
  MessageSquare,
  Bell,
  Monitor,
  Tag,
  Users,
  CalendarClock,
  Zap,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CreateCampaignPayload } from "@/services/campaigns";

// ── Channel definitions ──────────────────────────────────────────────────────

const CHANNELS = [
  {
    value: "EMAIL" as const,
    label: "Email",
    desc: "HTML email to subscribers",
    Icon: Mail,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
  },
  {
    value: "SMS" as const,
    label: "SMS",
    desc: "Text message campaign",
    Icon: MessageSquare,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  {
    value: "PUSH" as const,
    label: "Push",
    desc: "Browser / mobile push",
    Icon: Bell,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  {
    value: "IN_APP" as const,
    label: "In-App",
    desc: "In-product notification",
    Icon: Monitor,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
  },
] as const;

type CampaignChannel = (typeof CHANNELS)[number]["value"];

// ── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { icon: typeof CheckCircle2; color: string; bg: string; label: string }
> = {
  draft: {
    icon: AlertCircle,
    color: "text-content-secondary dark:text-foreground/70",
    bg: "bg-muted/30 dark:bg-muted/20",
    label: "Draft",
  },
  scheduled: {
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    label: "Scheduled",
  },
  sending: {
    icon: Send,
    color: "text-primary",
    bg: "bg-primary/10",
    label: "Sending",
  },
  completed: {
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    label: "Completed",
  },
  failed: {
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    label: "Failed",
  },
  cancelled: {
    icon: XCircle,
    color: "text-content-secondary dark:text-foreground/70",
    bg: "bg-muted/30 dark:bg-muted/20",
    label: "Cancelled",
  },
};

// ── Wizard state ─────────────────────────────────────────────────────────────

interface WizardState {
  // Step 1
  name: string;
  channel: CampaignChannel;
  // Step 2 — content
  contentMode: "template" | "direct";
  templateId: string;
  // Email
  subject: string;
  html_content: string;
  // SMS
  text_content: string;
  // Push
  push_title: string;
  push_body: string;
  push_image_url: string;
  push_action_url: string;
  // In-App
  inapp_title: string;
  inapp_body: string;
  inapp_image_url: string;
  inapp_action_url: string;
  inapp_action_text: string;
  // Step 3 — recipients
  recipientType: "all" | "tags" | "segment" | "custom";
  recipientTags: string[];
  tagInput: string;
  recipientSegment: string;
  // Step 4 — timing
  sendMode: "now" | "schedule";
  scheduledAt: string;
}

const DEFAULT_WIZARD: WizardState = {
  name: "",
  channel: "EMAIL",
  contentMode: "direct",
  templateId: "",
  subject: "",
  html_content: "",
  text_content: "",
  push_title: "",
  push_body: "",
  push_image_url: "",
  push_action_url: "",
  inapp_title: "",
  inapp_body: "",
  inapp_image_url: "",
  inapp_action_url: "",
  inapp_action_text: "",
  recipientType: "all",
  recipientTags: [],
  tagInput: "",
  recipientSegment: "",
  sendMode: "now",
  scheduledAt: "",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function isStep2Valid(w: WizardState): boolean {
  if (w.contentMode === "template") return !!w.templateId;
  switch (w.channel) {
    case "EMAIL":
      return !!w.subject.trim() && !!w.html_content.trim();
    case "SMS":
      return !!w.text_content.trim();
    case "PUSH":
      return !!w.push_title.trim() && !!w.push_body.trim();
    case "IN_APP":
      return !!w.inapp_title.trim() && !!w.inapp_body.trim();
  }
}

function isStep3Valid(w: WizardState): boolean {
  if (w.recipientType === "tags") return w.recipientTags.length > 0;
  if (w.recipientType === "segment") return !!w.recipientSegment.trim();
  return true;
}

function buildPayload(w: WizardState): CreateCampaignPayload {
  const base: CreateCampaignPayload = {
    name: w.name,
    channel: w.channel,
    recipientType: w.recipientType,
    recipientTags: w.recipientType === "tags" ? w.recipientTags : undefined,
    recipientSegment:
      w.recipientType === "segment" ? w.recipientSegment : undefined,
    status: w.sendMode === "schedule" ? "scheduled" : "draft",
    scheduledAt:
      w.sendMode === "schedule" && w.scheduledAt
        ? new Date(w.scheduledAt).toISOString()
        : undefined,
  };

  if (w.contentMode === "template") {
    return { ...base, templateId: w.templateId };
  }

  switch (w.channel) {
    case "EMAIL":
      return {
        ...base,
        subject: w.subject,
        html_content: w.html_content,
      };
    case "SMS":
      return { ...base, text_content: w.text_content };
    case "PUSH":
      return {
        ...base,
        push_title: w.push_title,
        push_body: w.push_body,
        push_image_url: w.push_image_url || undefined,
        push_action_url: w.push_action_url || undefined,
      };
    case "IN_APP":
      return {
        ...base,
        inapp_title: w.inapp_title,
        inapp_body: w.inapp_body,
        inapp_image_url: w.inapp_image_url || undefined,
        inapp_action_url: w.inapp_action_url || undefined,
        inapp_action_text: w.inapp_action_text || undefined,
      };
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Component
// ════════════════════════════════════════════════════════════════════════════

export default function AppCampaigns() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState(1);
  const [wizard, setWizard] = useState<WizardState>(DEFAULT_WIZARD);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    null,
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState<string | null>(
    null,
  );
  const [scheduleTime, setScheduleTime] = useState("");

  const {
    data: campaignsResponse,
    isLoading,
    error,
  } = useCampaigns(appId || "", {
    page: 1,
    limit: 100,
  });
  const { data: templatesResponse } = useAppTemplates(appId || "");

  const campaigns = campaignsResponse?.campaigns || [];
  const templates = templatesResponse?.templates || [];

  const createMutation = useCreateCampaign();
  const deleteMutation = useDeleteCampaign();
  const sendMutation = useSendCampaign();
  const scheduleMutation = useScheduleCampaign();
  const duplicateMutation = useDuplicateCampaign();

  const filtered = campaigns.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  // ── Wizard helpers ─────────────────────────────────────────────────────────

  const setW = (patch: Partial<WizardState>) =>
    setWizard((prev) => ({ ...prev, ...patch }));

  const openCreate = () => {
    setWizard(DEFAULT_WIZARD);
    setStep(1);
    setShowCreate(true);
  };

  const handleAddTag = () => {
    const tag = wizard.tagInput.trim().toLowerCase();
    if (tag && !wizard.recipientTags.includes(tag)) {
      setW({ recipientTags: [...wizard.recipientTags, tag], tagInput: "" });
    }
  };

  const handleRemoveTag = (t: string) =>
    setW({ recipientTags: wizard.recipientTags.filter((x) => x !== t) });

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleCreateCampaign = async () => {
    if (!appId) return;
    const payload = buildPayload(wizard);
    try {
      const campaign = await createMutation.mutateAsync({ appId, payload });
      // If send now → immediately send
      if (wizard.sendMode === "now" && campaign?.id) {
        await sendMutation.mutateAsync({
          appId,
          campaignId: campaign.id,
          payload: { dryRun: false },
        });
      }
      setShowCreate(false);
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

  const handleSendNow = async (campaignId: string) => {
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

  const handleScheduleSubmit = async () => {
    if (!appId || !showScheduleDialog || !scheduleTime) return;
    try {
      await scheduleMutation.mutateAsync({
        appId,
        campaignId: showScheduleDialog,
        scheduledAt: new Date(scheduleTime).toISOString(),
      });
      setShowScheduleDialog(null);
      setScheduleTime("");
    } catch (err) {
      console.error("Failed to schedule campaign:", err);
    }
  };

  const handleDuplicate = async (campaignId: string) => {
    if (!appId) return;
    const c = campaigns.find((x) => x.id === campaignId);
    if (!c) return;
    try {
      await duplicateMutation.mutateAsync({
        appId,
        campaignId,
        newName: `${c.name} (Copy)`,
      });
    } catch (err) {
      console.error("Failed to duplicate campaign:", err);
    }
  };

  // ── Loading / Error ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load campaigns. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search campaigns..."
          size="sm"
          className="flex-1 max-w-sm"
        />
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          New Campaign
        </Button>
      </div>

      {/* Campaign list */}
      {filtered.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 text-center">
            <Megaphone className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">
              No campaigns yet
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Create your first campaign to start reaching your audience.
            </p>
            <Button size="sm" onClick={openCreate} variant="outline">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Create Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((camp) => {
            const cfg = STATUS_CONFIG[camp.status] ?? STATUS_CONFIG.draft;
            const StatusIcon = cfg.icon;
            return (
              <Card
                key={camp.id}
                className="border-border/60 hover:border-border transition-colors hover:shadow-sm"
              >
                <CardContent className="flex items-center gap-4 py-3.5 px-4">
                  {/* Channel icon */}
                  <ChannelIconBox
                    channel={camp.channel}
                    className="h-9 w-9 shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {camp.name}
                      </span>
                      <ChannelBadge channel={camp.channel} />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {/* Status */}
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-[11px] font-medium",
                          cfg.color,
                        )}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                      {/* Recipients */}
                      <span className="text-[11px] text-muted-foreground">
                        ·{" "}
                        {camp.recipientCount > 0
                          ? `${camp.recipientCount} recipients`
                          : camp.recipientType}
                      </span>
                      {/* Delivery rate */}
                      {camp.status === "completed" && camp.sentCount > 0 && (
                        <span className="text-[11px] text-muted-foreground">
                          · {camp.deliveredCount}/{camp.sentCount} delivered
                        </span>
                      )}
                      {/* Scheduled time */}
                      {camp.scheduledAt && camp.status === "scheduled" && (
                        <span className="text-[11px] text-amber-600 dark:text-amber-400">
                          · {new Date(camp.scheduledAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {camp.status === "completed" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        title="Analytics"
                        onClick={() =>
                          navigate(
                            `/dashboard/apps/${appId}/campaigns/${camp.id}/analytics`,
                          )
                        }
                      >
                        <BarChart3 className="h-3.5 w-3.5 text-primary" />
                      </Button>
                    )}
                    {camp.status === "draft" && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-xs gap-1 text-primary hover:text-primary"
                          title="Send now"
                          onClick={() => handleSendNow(camp.id)}
                          disabled={sendMutation.isPending}
                        >
                          {sendMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5" />
                          )}
                          Send
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-xs gap-1"
                          title="Schedule"
                          onClick={() => {
                            setShowScheduleDialog(camp.id);
                            setScheduleTime("");
                          }}
                        >
                          <CalendarClock className="h-3.5 w-3.5" />
                          Schedule
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      title="Duplicate"
                      onClick={() => handleDuplicate(camp.id)}
                      disabled={duplicateMutation.isPending}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      title="Delete"
                      onClick={() => {
                        setSelectedCampaignId(camp.id);
                        setShowDeleteConfirm(true);
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive/70 hover:text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          Campaign Builder Wizard
      ═══════════════════════════════════════════════════════════════════ */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-primary" />
              New Campaign
              <span className="ml-auto text-xs text-muted-foreground font-normal">
                Step {step} of 4
              </span>
            </DialogTitle>
          </DialogHeader>

          {/* Progress bar */}
          <div className="flex gap-1 -mt-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-200",
                  s <= step ? "bg-primary" : "bg-muted",
                )}
              />
            ))}
          </div>

          {/* ── Step 1: Name & Channel ────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label>Campaign Name *</Label>
                <Input
                  placeholder="e.g. Welcome Series, Product Update"
                  value={wizard.name}
                  onChange={(e) => setW({ name: e.target.value })}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label>Channel *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CHANNELS.map((ch) => {
                    const active = wizard.channel === ch.value;
                    return (
                      <button
                        key={ch.value}
                        type="button"
                        onClick={() => setW({ channel: ch.value })}
                        className={cn(
                          "flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all",
                          active
                            ? `${ch.border} ${ch.bg}`
                            : "border-border hover:border-border/80 hover:bg-muted/40",
                        )}
                      >
                        <div
                          className={cn(
                            "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                            active ? ch.bg : "bg-muted",
                          )}
                        >
                          <ch.Icon
                            className={cn(
                              "h-4 w-4",
                              active ? ch.color : "text-muted-foreground",
                            )}
                          />
                        </div>
                        <div>
                          <p
                            className={cn(
                              "text-sm font-semibold",
                              active ? ch.color : "text-foreground",
                            )}
                          >
                            {ch.label}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {ch.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Content ───────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Content mode tabs */}
              <Tabs
                value={wizard.contentMode}
                onValueChange={(v) =>
                  setW({ contentMode: v as "template" | "direct" })
                }
              >
                <TabsList className="w-full">
                  <TabsTrigger value="direct" className="flex-1 gap-1.5">
                    <Zap className="h-3.5 w-3.5" />
                    Write Content
                  </TabsTrigger>
                  <TabsTrigger value="template" className="flex-1 gap-1.5">
                    <Copy className="h-3.5 w-3.5" />
                    Use Template
                  </TabsTrigger>
                </TabsList>

                {/* Direct content */}
                <TabsContent value="direct" className="mt-4 space-y-4">
                  {wizard.channel === "EMAIL" && (
                    <>
                      <div className="space-y-1.5">
                        <Label>Subject Line *</Label>
                        <Input
                          placeholder="e.g. 🚀 Big news — check this out"
                          value={wizard.subject}
                          onChange={(e) => setW({ subject: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>HTML Content *</Label>
                        <Textarea
                          placeholder={`<h1>Hello {{first_name}}</h1>\n<p>Your message here...</p>`}
                          value={wizard.html_content}
                          onChange={(e) =>
                            setW({ html_content: e.target.value })
                          }
                          className="font-mono text-xs min-h-[180px] resize-y"
                        />
                        <p className="text-[11px] text-muted-foreground">
                          Supports HTML. Use{" "}
                          <code className="bg-muted px-1 rounded">
                            {"{{variable}}"}
                          </code>{" "}
                          for personalization.
                        </p>
                      </div>
                    </>
                  )}

                  {wizard.channel === "SMS" && (
                    <div className="space-y-1.5">
                      <Label>Message *</Label>
                      <Textarea
                        placeholder="Hi {{first_name}}, your order is ready! Reply STOP to unsubscribe."
                        value={wizard.text_content}
                        onChange={(e) => setW({ text_content: e.target.value })}
                        className="min-h-[120px] resize-y"
                        maxLength={1000}
                      />
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Plain text — no HTML</span>
                        <span>{wizard.text_content.length} / 1000</span>
                      </div>
                    </div>
                  )}

                  {wizard.channel === "PUSH" && (
                    <>
                      <div className="space-y-1.5">
                        <Label>Title *</Label>
                        <Input
                          placeholder="e.g. New message from Sarah"
                          value={wizard.push_title}
                          onChange={(e) => setW({ push_title: e.target.value })}
                          maxLength={65}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Body *</Label>
                        <Textarea
                          placeholder="e.g. Hey, just wanted to check in..."
                          value={wizard.push_body}
                          onChange={(e) => setW({ push_body: e.target.value })}
                          className="min-h-[80px] resize-none"
                          maxLength={200}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-muted-foreground text-xs">
                            Image URL{" "}
                            <span className="text-[10px]">(optional)</span>
                          </Label>
                          <Input
                            placeholder="https://..."
                            value={wizard.push_image_url}
                            onChange={(e) =>
                              setW({ push_image_url: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-muted-foreground text-xs">
                            Action URL{" "}
                            <span className="text-[10px]">(optional)</span>
                          </Label>
                          <Input
                            placeholder="https://..."
                            value={wizard.push_action_url}
                            onChange={(e) =>
                              setW({ push_action_url: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {wizard.channel === "IN_APP" && (
                    <>
                      <div className="space-y-1.5">
                        <Label>Title *</Label>
                        <Input
                          placeholder="e.g. Your report is ready"
                          value={wizard.inapp_title}
                          onChange={(e) =>
                            setW({ inapp_title: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Body *</Label>
                        <Textarea
                          placeholder="e.g. Your monthly report has been generated."
                          value={wizard.inapp_body}
                          onChange={(e) => setW({ inapp_body: e.target.value })}
                          className="min-h-[80px] resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-muted-foreground text-xs">
                            Image URL{" "}
                            <span className="text-[10px]">(optional)</span>
                          </Label>
                          <Input
                            placeholder="https://..."
                            value={wizard.inapp_image_url}
                            onChange={(e) =>
                              setW({ inapp_image_url: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-muted-foreground text-xs">
                            Action URL{" "}
                            <span className="text-[10px]">(optional)</span>
                          </Label>
                          <Input
                            placeholder="https://..."
                            value={wizard.inapp_action_url}
                            onChange={(e) =>
                              setW({ inapp_action_url: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-muted-foreground text-xs">
                          Action Button Label{" "}
                          <span className="text-[10px]">(optional)</span>
                        </Label>
                        <Input
                          placeholder="e.g. View Report"
                          value={wizard.inapp_action_text}
                          onChange={(e) =>
                            setW({ inapp_action_text: e.target.value })
                          }
                        />
                      </div>
                    </>
                  )}
                </TabsContent>

                {/* Template mode */}
                <TabsContent value="template" className="mt-4">
                  {templates.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No templates available. Create one in the Templates
                      section.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                      {templates.map((t) => {
                        const tplId = t.template?.id;
                        const selected = wizard.templateId === tplId;
                        return (
                          <button
                            key={tplId}
                            type="button"
                            onClick={() => setW({ templateId: tplId })}
                            className={cn(
                              "w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors",
                              selected
                                ? "border-primary bg-primary/5 text-foreground"
                                : "border-border text-foreground hover:border-primary/40 hover:bg-muted/40",
                            )}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate text-foreground">
                                {t.template?.code || "Unnamed"}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {t.template?.channel || "—"}
                              </p>
                            </div>
                            <Badge
                              variant="secondary"
                              className="text-[10px] shrink-0"
                            >
                              {t.status || "active"}
                            </Badge>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* ── Step 3: Recipients ────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Who should receive this campaign?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      {
                        value: "all",
                        label: "All Contacts",
                        desc: "Every subscribed contact",
                        Icon: Users,
                      },
                      {
                        value: "tags",
                        label: "By Tags",
                        desc: "Filter by contact tags",
                        Icon: Tag,
                      },
                    ] as const
                  ).map((opt) => {
                    const active = wizard.recipientType === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setW({ recipientType: opt.value })}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all",
                          active
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-border/80 hover:bg-muted/40",
                        )}
                      >
                        <div
                          className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                            active ? "bg-primary/10" : "bg-muted",
                          )}
                        >
                          <opt.Icon
                            className={cn(
                              "h-4 w-4",
                              active ? "text-primary" : "text-muted-foreground",
                            )}
                          />
                        </div>
                        <div>
                          <p
                            className={cn(
                              "text-sm font-semibold",
                              active ? "text-primary" : "text-foreground",
                            )}
                          >
                            {opt.label}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {opt.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tags input */}
              {wizard.recipientType === "tags" && (
                <div className="space-y-2">
                  <Label>Tags *</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. newsletter, interest:technology"
                      value={wizard.tagInput}
                      onChange={(e) => setW({ tagInput: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddTag}
                      disabled={!wizard.tagInput.trim()}
                    >
                      Add
                    </Button>
                  </div>
                  {wizard.recipientTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {wizard.recipientTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
                        >
                          <Tag className="h-2.5 w-2.5" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-0.5 hover:text-destructive transition-colors"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-[11px] text-muted-foreground">
                    Contacts with ANY of these tags will receive the campaign.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Step 4: Timing & Review ───────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-4">
              {/* Send mode */}
              <div className="space-y-2">
                <Label>When to send?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      {
                        value: "now",
                        label: "Send Now",
                        desc: "Deliver immediately",
                        Icon: Zap,
                      },
                      {
                        value: "schedule",
                        label: "Schedule",
                        desc: "Pick a date & time",
                        Icon: CalendarClock,
                      },
                    ] as const
                  ).map((opt) => {
                    const active = wizard.sendMode === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setW({ sendMode: opt.value })}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all",
                          active
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-border/80 hover:bg-muted/40",
                        )}
                      >
                        <div
                          className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                            active ? "bg-primary/10" : "bg-muted",
                          )}
                        >
                          <opt.Icon
                            className={cn(
                              "h-4 w-4",
                              active ? "text-primary" : "text-muted-foreground",
                            )}
                          />
                        </div>
                        <div>
                          <p
                            className={cn(
                              "text-sm font-semibold",
                              active ? "text-primary" : "text-foreground",
                            )}
                          >
                            {opt.label}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {opt.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {wizard.sendMode === "schedule" && (
                <div className="space-y-1.5">
                  <Label>Scheduled Date & Time *</Label>
                  <Input
                    type="datetime-local"
                    value={wizard.scheduledAt}
                    min={new Date(Date.now() + 60000)
                      .toISOString()
                      .slice(0, 16)}
                    onChange={(e) => setW({ scheduledAt: e.target.value })}
                  />
                </div>
              )}

              {/* Review summary */}
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2.5">
                <p className="text-sm font-semibold text-foreground mb-1">
                  Campaign Summary
                </p>
                <SummaryRow label="Name" value={wizard.name} />
                <SummaryRow
                  label="Channel"
                  value={<ChannelBadge channel={wizard.channel} />}
                />
                <SummaryRow
                  label="Content"
                  value={
                    wizard.contentMode === "template"
                      ? `Template: ${
                          templates.find(
                            (t) => t.template?.id === wizard.templateId,
                          )?.template?.code || wizard.templateId
                        }`
                      : wizard.channel === "EMAIL"
                        ? `Email: "${wizard.subject}"`
                        : wizard.channel === "SMS"
                          ? "SMS message"
                          : wizard.channel === "PUSH"
                            ? `Push: "${wizard.push_title}"`
                            : `In-App: "${wizard.inapp_title}"`
                  }
                />
                <SummaryRow
                  label="Recipients"
                  value={
                    wizard.recipientType === "all"
                      ? "All contacts"
                      : wizard.recipientType === "tags"
                        ? `Tags: ${wizard.recipientTags.join(", ")}`
                        : wizard.recipientType
                  }
                />
                <SummaryRow
                  label="Timing"
                  value={
                    wizard.sendMode === "now"
                      ? "Send immediately"
                      : wizard.scheduledAt
                        ? new Date(wizard.scheduledAt).toLocaleString()
                        : "Not set"
                  }
                />
              </div>
            </div>
          )}

          {/* Footer nav */}
          <DialogFooter className="flex justify-between gap-2 sm:gap-0 pt-2">
            <div>
              {step > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(step - 1)}
                  disabled={createMutation.isPending}
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreate(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              {step < 4 ? (
                <Button
                  size="sm"
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 && (!wizard.name.trim() || !wizard.channel)) ||
                    (step === 2 && !isStep2Valid(wizard)) ||
                    (step === 3 && !isStep3Valid(wizard))
                  }
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleCreateCampaign}
                  disabled={
                    createMutation.isPending ||
                    (wizard.sendMode === "schedule" && !wizard.scheduledAt)
                  }
                >
                  {createMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : wizard.sendMode === "now" ? (
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                  ) : (
                    <CalendarClock className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  {createMutation.isPending
                    ? "Creating..."
                    : wizard.sendMode === "now"
                      ? "Create & Send"
                      : "Schedule Campaign"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Schedule existing campaign ─────────────────────────────────────── */}
      <Dialog
        open={!!showScheduleDialog}
        onOpenChange={() => setShowScheduleDialog(null)}
      >
        <DialogContent className="sm:max-w-sm max-h-[90vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              Schedule Campaign
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Send at</Label>
            <Input
              type="datetime-local"
              value={scheduleTime}
              min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
              onChange={(e) => setScheduleTime(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowScheduleDialog(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleScheduleSubmit}
              disabled={!scheduleTime || scheduleMutation.isPending}
            >
              {scheduleMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <CalendarClock className="h-3.5 w-3.5 mr-1.5" />
              )}
              Confirm Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirmation ────────────────────────────────────────────── */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle>Delete Campaign?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. The campaign and all its data will be
            permanently deleted.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteCampaign}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : null}
              {deleteMutation.isPending ? "Deleting..." : "Delete Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Summary row helper ────────────────────────────────────────────────────────

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-muted-foreground w-20 shrink-0">
        {label}
      </span>
      <span className="text-xs text-foreground flex-1 min-w-0 truncate">
        {value}
      </span>
    </div>
  );
}
