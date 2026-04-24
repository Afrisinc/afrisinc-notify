import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Mail,
  MessageSquare,
  Bell,
  Monitor,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

export type TemplateChannel = "email" | "sms" | "push" | "in-app" | "whatsapp";

interface ChannelOption {
  id: TemplateChannel;
  label: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  badge?: string;
}

const CHANNELS: ChannelOption[] = [
  {
    id: "email",
    label: "Email",
    description: "Rich HTML emails with visual drag-and-drop builder",
    icon: Mail,
    color: "text-primary",
    bgColor: "bg-primary/10 dark:bg-primary/15",
    borderColor: "border-primary/30 hover:border-primary/60",
  },
  {
    id: "sms",
    label: "SMS",
    description: "Text messages with character limits and Unicode support",
    icon: MessageSquare,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor:
      "border-emerald-200 hover:border-emerald-400 dark:border-emerald-800 dark:hover:border-emerald-500",
  },
  {
    id: "push",
    label: "Push Notification",
    description: "Browser and mobile push notifications with media support",
    icon: Bell,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor:
      "border-amber-200 hover:border-amber-400 dark:border-amber-800 dark:hover:border-amber-500",
  },
  {
    id: "in-app",
    label: "In-App",
    description: "Banners, modals, and toasts shown inside your application",
    icon: Monitor,
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
    borderColor:
      "border-violet-200 hover:border-violet-400 dark:border-violet-800 dark:hover:border-violet-500",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    description:
      "WhatsApp Business message templates with headers, body, and buttons",
    icon: MessageCircle,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor:
      "border-green-200 hover:border-green-400 dark:border-green-800 dark:hover:border-green-500",
    badge: "Meta API",
  },
];

interface ChannelSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (channel: TemplateChannel) => void;
}

export function ChannelSelectorDialog({
  open,
  onOpenChange,
  onSelect,
}: ChannelSelectorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-2xl">
        <div className="px-8 pt-8 pb-2">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
              Choose a channel
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Select the delivery channel for your new notification template.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-8 pb-8 pt-4 grid grid-cols-1 gap-3">
          {CHANNELS.map((channel) => {
            const Icon = channel.icon;
            return (
              <button
                key={channel.id}
                onClick={() => onSelect(channel.id)}
                className={cn(
                  "group flex items-center gap-4 w-full text-left rounded-xl border p-4",
                  "transition-all duration-150 cursor-pointer",
                  "bg-card hover:bg-muted/40 dark:hover:bg-muted/20",
                  channel.borderColor,
                )}
              >
                <div
                  className={cn(
                    "flex-shrink-0 h-11 w-11 rounded-xl flex items-center justify-center",
                    channel.bgColor,
                  )}
                >
                  <Icon className={cn("h-5 w-5", channel.color)} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {channel.label}
                    </span>
                    {channel.badge && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                        {channel.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {channel.description}
                  </p>
                </div>

                <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
