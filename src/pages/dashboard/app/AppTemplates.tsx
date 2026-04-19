import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { appTemplates } from "@/data/mockData";
import { useAppTemplates, useDeleteAppTemplate } from "@/hooks/useApps";
import { useSendNotification } from "@/hooks/useNotifications";
import { extractVariableNames } from "@/lib/templateUtils";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Copy, Trash2, Send, Store, FileText, Eye, Variable, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SearchInput } from "@/components/ui/search-input";

const channelColor: Record<string, string> = {
  email: "bg-primary/15 text-primary",
  EMAIL: "bg-primary/15 text-primary",
  sms: "bg-success/15 text-success",
  SMS: "bg-success/15 text-success",
  push: "bg-warning/15 text-warning",
  PUSH: "bg-warning/15 text-warning",
  "in-app": "bg-accent text-accent-foreground",
  IN_APP: "bg-accent text-accent-foreground",
  WHATSAPP: "bg-info/15 text-info",
};
const statusColor: Record<string, string> = {
  active: "bg-success/15 text-success",
  draft: "bg-muted text-muted-foreground",
  archived: "bg-destructive/15 text-destructive",
};

// Validation schema for send notification
const sendNotificationSchema = z.object({
  recipient: z.string().email("Invalid email address"),
  channel: z.enum(["EMAIL", "SMS", "PUSH", "IN_APP", "WHATSAPP"]),
});

type SendNotificationFormData = z.infer<typeof sendNotificationSchema>;

export default function AppTemplates() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const deleteTemplateMutation = useDeleteAppTemplate();
  const sendNotificationMutation = useSendNotification();

  // Fetch templates from app endpoint
  const { data: appTemplatesResponse, isLoading } = useAppTemplates(appId || "", {
    enabled: !!appId,
  });

  // Extract templates from response or use mock data
  const templates = appTemplatesResponse?.templates || appTemplates.filter((t) => t.appId === appId);

  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState<{ appId: string; templateId: string } | null>(null);
  const [sendNotifyDialog, setSendNotifyDialog] = useState<{ templateId: string; templateName: string } | null>(null);

  // Form for sending notification
  const form = useForm<SendNotificationFormData>({
    resolver: zodResolver(sendNotificationSchema),
    defaultValues: {
      recipient: "",
      channel: "EMAIL",
    },
  });

  const handleDeleteTemplate = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteTemplateMutation.mutateAsync({
        appId: deleteConfirm.appId,
        templateId: deleteConfirm.templateId,
      });
      toast({
        title: 'Success',
        description: 'Template deleted successfully',
      });
      setDeleteConfirm(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      });
    }
  };

  const handleSendNotification = async (data: SendNotificationFormData) => {
    if (!sendNotifyDialog) return;

    try {
      await sendNotificationMutation.mutateAsync({
        channel: data.channel,
        recipient: data.recipient,
        templateId: sendNotifyDialog.templateId,
        appId,
      });
      toast({
        title: 'Success',
        description: `Notification sent to ${data.recipient}`,
      });
      setSendNotifyDialog(null);
      form.reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send notification',
        variant: 'destructive',
      });
    }
  };

  const filtered = templates.filter((t) => {
    // Handle both API response format (nested template) and mock format
    const template = (t as any).template || t;
    const name = typeof template.name === "string" ? template.name : template.code || "";
    const matchSearch = name.toLowerCase().includes(search.toLowerCase());
    const channel = (template.channel || "").toLowerCase();
    const filterChannel = channelFilter.toLowerCase();
    const matchChannel = channelFilter === "all" || channel === filterChannel;
    return matchSearch && matchChannel;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search templates..."
            size="sm"
            className="flex-1 max-w-sm"
          />
          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Channel" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
              <SelectItem value="push">Push</SelectItem>
              <SelectItem value="in-app">In-App</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/marketplace")}>
            <Store className="h-3.5 w-3.5 mr-1.5" /> Marketplace
          </Button>
          <Button size="sm" onClick={() => navigate(`/editor/${appId}/new`)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Create Template
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-8 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-content-secondary">Loading templates...</span>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {!isLoading && filtered.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 text-center">
            <FileText className="h-10 w-10 icon-muted mx-auto mb-3" />
            <p className="text-sm text-content-secondary">No templates found. Create one or import from the marketplace.</p>
          </CardContent>
        </Card>
      ) : !isLoading ? (
        <div className="space-y-2">
          {filtered.map((item: any) => {
            // Extract template from API response or use direct template (mock)
            const tpl = item.template || item;
            const templateId = tpl.id || item.id;

            // Use utility to extract variable names from API or mock data
            const templateName = tpl.subject || tpl.code || tpl.description || "Untitled";
            const variables = extractVariableNames(tpl);
            const createdBy = tpl.createdBy || "System";
            const updatedAt = tpl.updatedAt ? new Date(tpl.updatedAt).toLocaleDateString() : "Unknown";
            const version = tpl.version || 1;
            const isActive = tpl.active !== false;

            return (
              <Card key={templateId} className="border-border/60 hover:border-border transition-colors">
                <CardContent className="flex items-center justify-between py-3 px-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-foreground truncate">{templateName}</span>
                      <span className="text-xs text-muted-foreground">v{version} · {createdBy} · {updatedAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {variables.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Variable className="h-3.5 w-3.5 text-muted-foreground" />
                        <div className="flex gap-1 flex-wrap">
                          {variables.slice(0, 2).map((v: any, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-[9px] py-0">
                              {v}
                            </Badge>
                          ))}
                          {variables.length > 2 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="outline" className="text-[9px] py-0 cursor-help">
                                    +{variables.length - 2}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium">Available variables:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {variables.map((v: any, idx: number) => (
                                        <code key={idx} className="text-[10px] bg-muted/50 px-1.5 py-0.5 rounded">
                                          {`{{${v}}}`}
                                        </code>
                                      ))}
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    )}
                    <Badge variant="secondary" className={`text-[10px] ${channelColor[tpl.channel]}`}>
                      {tpl.channel || "N/A"}
                    </Badge>
                    <Badge variant="secondary" className={`text-[10px] ${statusColor[isActive ? "active" : "draft"]}`}>
                      {isActive ? "active" : "draft"}
                    </Badge>
                  <div className="flex gap-0.5 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        // Email templates use dedicated editor, others use dashboard editor
                        if ((tpl.channel || "").toLowerCase() === 'email') {
                          navigate(`/editor/${appId}/${templateId}`);
                        } else {
                          navigate(`/dashboard/apps/${appId}/templates/${templateId}`);
                        }
                      }}
                      title="View/Edit template"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        // Email templates use dedicated editor, others use dashboard editor
                        if ((tpl.channel || "").toLowerCase() === 'email') {
                          navigate(`/editor/${appId}/${templateId}`);
                        } else {
                          navigate(`/dashboard/apps/${appId}/templates/${templateId}`);
                        }
                      }}
                      title="Edit template"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" title="Duplicate template"><Copy className="h-3 w-3" /></Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:text-primary"
                      title="Send notification"
                      onClick={() => setSendNotifyDialog({ templateId, templateName })}
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:text-destructive"
                      title="Delete template"
                      onClick={() => setDeleteConfirm({ appId: appId || "", templateId })}
                      disabled={deleteTemplateMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      ) : null}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Template</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this template? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel disabled={deleteTemplateMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              disabled={deleteTemplateMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTemplateMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send Notification Dialog */}
      <Dialog open={!!sendNotifyDialog} onOpenChange={(open) => !open && setSendNotifyDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>
              Send "{sendNotifyDialog?.templateName}" template to a recipient
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSendNotification)} className="space-y-4">
              <FormField
                control={form.control}
                name="channel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EMAIL">Email</SelectItem>
                        <SelectItem value="SMS">SMS</SelectItem>
                        <SelectItem value="PUSH">Push</SelectItem>
                        <SelectItem value="IN_APP">In-App</SelectItem>
                        <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recipient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="user@example.com"
                        disabled={sendNotificationMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSendNotifyDialog(null)}
                  disabled={sendNotificationMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={sendNotificationMutation.isPending}
                  className="gap-2"
                >
                  {sendNotificationMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Notification
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
