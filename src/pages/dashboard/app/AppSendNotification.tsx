import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppTemplates } from "@/hooks/useApps";
import { useSendNotification } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChannelIconBox, ChannelBadge } from "@/components/ui/ChannelBadge";
import type { Channel } from "@/components/ui/ChannelBadge";
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  Loader2,
  User,
  FileText,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ────────────────────────────────────────────────────

type NotifChannel = "EMAIL" | "SMS" | "PUSH" | "IN_APP" | "WHATSAPP";

const CHANNELS: { value: NotifChannel; label: string; hint: string }[] = [
  { value: "EMAIL", label: "Email", hint: "user@example.com" },
  { value: "SMS", label: "SMS", hint: "+1234567890" },
  { value: "PUSH", label: "Push", hint: "device-token or user ID" },
  { value: "IN_APP", label: "In-App", hint: "user ID" },
  { value: "WHATSAPP", label: "WhatsApp", hint: "+1234567890" },
];

// Dynamic schema — recipient validation relaxes for non-email channels
function buildSchema(channel: NotifChannel) {
  return z.object({
    channel: z.enum(["EMAIL", "SMS", "PUSH", "IN_APP", "WHATSAPP"]),
    templateId: z.string().min(1, "Select a template"),
    recipient:
      channel === "EMAIL"
        ? z.string().email("Enter a valid email address")
        : z.string().min(2, "Recipient is required"),
    variables: z.record(z.string()).optional(),
  });
}

type FormData = {
  channel: NotifChannel;
  templateId: string;
  recipient: string;
  variables?: Record<string, string>;
};

// ── Channel Picker ───────────────────────────────────────────

function ChannelPicker({
  value,
  onChange,
  disabled,
}: {
  value: NotifChannel;
  onChange: (v: NotifChannel) => void;
  disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {CHANNELS.map((ch) => (
        <button
          key={ch.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(ch.value)}
          className={cn(
            "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-150 text-center",
            value === ch.value
              ? "border-primary/40 bg-primary/5 shadow-[0_0_0_1px_hsl(var(--primary)/0.3)]"
              : "border-border/40 bg-card hover:border-primary/20 hover:bg-muted/30",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          <ChannelIconBox channel={ch.value as Channel} className="h-8 w-8" />
          <span
            className={cn(
              "text-[10px] font-semibold leading-tight",
              value === ch.value ? "text-primary" : "text-muted-foreground",
            )}
          >
            {ch.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// ── Send Preview Panel ───────────────────────────────────────

function PreviewPanel({
  channel,
  templateName,
  recipient,
  variables,
  ready,
}: {
  channel: NotifChannel;
  templateName?: string;
  recipient?: string;
  variables?: Record<string, string>;
  ready: boolean;
}) {
  const rows = [
    {
      icon: Zap,
      label: "Channel",
      value: channel ? <ChannelBadge channel={channel as Channel} /> : null,
    },
    { icon: FileText, label: "Template", value: templateName || null },
    { icon: User, label: "Recipient", value: recipient || null },
  ];

  const varEntries = Object.entries(variables ?? {}).filter(([, v]) => v);

  return (
    <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between">
        <p className="text-xs font-semibold text-foreground">Preview</p>
        <span
          className={cn(
            "text-[10px] font-semibold px-2 py-0.5 rounded-full",
            ready
              ? "bg-success/10 text-success"
              : "bg-muted text-muted-foreground",
          )}
        >
          {ready ? "Ready to send" : "Incomplete"}
        </span>
      </div>

      <div className="p-4 space-y-3">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3">
            <div className="h-7 w-7 rounded-lg bg-muted/40 flex items-center justify-center shrink-0">
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
                {label}
              </p>
              {value ? (
                <div className="text-sm font-medium text-foreground break-all">
                  {value}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground/50 italic">
                  Not set
                </div>
              )}
            </div>
          </div>
        ))}

        {varEntries.length > 0 && (
          <div className="border-t border-border/30 pt-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Variables
            </p>
            <div className="space-y-1">
              {varEntries.map(([k, v]) => (
                <div key={k} className="flex gap-2 text-xs">
                  <span className="font-mono text-primary/80">{`{{${k}}}`}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-foreground truncate">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────

export default function AppSendNotification() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sent, setSent] = useState(false);
  const [activeChannel, setActiveChannel] = useState<NotifChannel>("EMAIL");

  const { data: appTemplatesResponse, isLoading: templatesLoading } =
    useAppTemplates(appId ?? "", { enabled: !!appId });

  const allTemplates = (appTemplatesResponse?.templates ?? []).map(
    (t: any) => t.template ?? t,
  );
  const channelTemplates = allTemplates.filter(
    (t: any) => t.channel === activeChannel,
  );

  const sendMutation = useSendNotification();

  const form = useForm<FormData>({
    resolver: zodResolver(buildSchema(activeChannel)),
    defaultValues: {
      channel: "EMAIL",
      templateId: "",
      recipient: "",
      variables: {},
    },
  });

  const watchedTemplateId = useWatch({
    control: form.control,
    name: "templateId",
  });
  const watchedRecipient = useWatch({
    control: form.control,
    name: "recipient",
  });
  const watchedVariables = useWatch({
    control: form.control,
    name: "variables",
  });

  const selectedTemplate = channelTemplates.find(
    (t: any) => t.id === watchedTemplateId,
  );
  const requiredVars: string[] = selectedTemplate?.requiredVariables ?? [];

  const channelHint =
    CHANNELS.find((c) => c.value === activeChannel)?.hint ?? "";

  const isReady =
    !!watchedTemplateId && !!watchedRecipient && watchedRecipient.length > 1;

  const handleChannelChange = (ch: NotifChannel) => {
    setActiveChannel(ch);
    form.setValue("channel", ch);
    form.setValue("templateId", ""); // reset template when channel changes
    form.setValue("variables", {});
    form.clearErrors();
  };

  const onSubmit = async (data: FormData) => {
    try {
      await sendMutation.mutateAsync({
        channel: data.channel,
        recipient: data.recipient,
        templateId: data.templateId,
        appId,
        payload:
          data.variables && Object.keys(data.variables).length
            ? data.variables
            : undefined,
      });
      setSent(true);
    } catch (err) {
      toast({
        title: "Failed to send",
        description:
          err instanceof Error ? err.message : "Could not send notification",
        variant: "destructive",
      });
    }
  };

  // ── Success Screen ───────────────────────────────────────

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="h-16 w-16 rounded-2xl bg-success/10 flex items-center justify-center mb-5 shadow-[0_0_0_8px_hsl(var(--success)/0.06)]">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Notification Sent</h2>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-xs leading-relaxed">
          Your notification has been queued for delivery and will be processed
          shortly.
        </p>
        <div className="flex gap-3 mt-8">
          <Button
            variant="outline"
            className="h-9 rounded-xl px-5 text-sm"
            onClick={() => {
              setSent(false);
              form.reset();
              setActiveChannel("EMAIL");
            }}
          >
            Send Another
          </Button>
          <Button
            className="h-9 rounded-xl px-5 text-sm shadow-primary"
            onClick={() => navigate(`/dashboard/apps/${appId}/notifications`)}
          >
            View Notifications
          </Button>
        </div>
      </motion.div>
    );
  }

  // ── Form ─────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg"
          onClick={() => navigate(`/dashboard/apps/${appId}/notifications`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-base font-bold text-foreground">
            Send Notification
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Send a test or trigger a one-off notification
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4 items-start">
            {/* ── Left: Form ── */}
            <div className="space-y-4">
              {/* Channel */}
              <Card className="border-border/40">
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-0.5">
                      Channel
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Select how to deliver this notification
                    </p>
                  </div>
                  <ChannelPicker
                    value={activeChannel}
                    onChange={handleChannelChange}
                    disabled={sendMutation.isPending}
                  />
                </CardContent>
              </Card>

              {/* Template */}
              <Card className="border-border/40">
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-0.5">
                      Template
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {channelTemplates.length > 0
                        ? `${channelTemplates.length} ${activeChannel.toLowerCase()} template${channelTemplates.length !== 1 ? "s" : ""} available`
                        : "No templates for this channel yet"}
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="templateId"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={
                            templatesLoading ||
                            sendMutation.isPending ||
                            channelTemplates.length === 0
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="h-9 text-sm rounded-lg">
                              <SelectValue
                                placeholder={
                                  templatesLoading
                                    ? "Loading..."
                                    : "Select a template"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {channelTemplates.map((t: any) => (
                              <SelectItem
                                key={t.id}
                                value={t.id}
                                className="py-2"
                              >
                                <div className="flex items-center gap-2">
                                  <ChannelBadge
                                    channel={t.channel as Channel}
                                  />
                                  <span className="font-mono text-xs text-foreground">
                                    {t.code}
                                  </span>
                                  {t.description && (
                                    <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                                      — {t.description}
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Template info chip */}
                  {selectedTemplate && (
                    <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                      {selectedTemplate.subject && (
                        <span className="px-2 py-0.5 rounded-md bg-muted/40 border border-border/30">
                          Subject:{" "}
                          <span className="text-foreground font-medium">
                            {selectedTemplate.subject}
                          </span>
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md bg-muted/40 border border-border/30">
                        v{selectedTemplate.version ?? 1}
                      </span>
                      {selectedTemplate.language && (
                        <span className="px-2 py-0.5 rounded-md bg-muted/40 border border-border/30">
                          {selectedTemplate.language.toUpperCase()}
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recipient */}
              <Card className="border-border/40">
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-0.5">
                      Recipient
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      e.g. {channelHint}
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name="recipient"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={channelHint}
                            type={activeChannel === "EMAIL" ? "email" : "text"}
                            className="h-9 text-sm rounded-lg"
                            disabled={sendMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Variables — only show if template has requiredVariables */}
              <AnimatePresence>
                {requiredVars.length > 0 && (
                  <motion.div
                    key="vars"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="border-border/40">
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-foreground mb-0.5">
                            Template Variables
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Fill in the values for this template's placeholders
                          </p>
                        </div>
                        <div className="space-y-3">
                          {requiredVars.map((varName) => (
                            <FormField
                              key={varName}
                              control={form.control}
                              name={`variables.${varName}` as any}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs flex items-center gap-1.5">
                                    <span className="font-mono text-primary/80 text-[11px]">{`{{${varName}}}`}</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder={`Value for ${varName}`}
                                      className="h-8 text-sm rounded-lg font-mono"
                                      disabled={sendMutation.isPending}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Send Button */}
              <Button
                type="submit"
                className="w-full h-10 rounded-xl text-sm font-semibold shadow-primary gap-2"
                disabled={
                  sendMutation.isPending || templatesLoading || !isReady
                }
              >
                {sendMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Send Notification
                  </>
                )}
              </Button>
            </div>

            {/* ── Right: Preview Panel ── */}
            <div className="hidden lg:block sticky top-4">
              <PreviewPanel
                channel={activeChannel}
                templateName={
                  selectedTemplate?.code ?? selectedTemplate?.description
                }
                recipient={watchedRecipient}
                variables={watchedVariables}
                ready={isReady}
              />
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
