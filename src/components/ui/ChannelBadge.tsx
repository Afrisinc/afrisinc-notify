import { Mail, MessageSquare, Bell, Monitor, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type Channel = "EMAIL" | "SMS" | "PUSH" | "IN_APP" | "WHATSAPP" | "email" | "sms" | "push" | "in-app" | "in_app" | "whatsapp";

interface ChannelConfig {
  label: string;
  Icon: React.FC<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  pillBg: string;
  pillText: string;
  dot: string;
}

const CONFIG: Record<string, ChannelConfig> = {
  email: {
    label: "Email",
    Icon: Mail,
    iconBg: "bg-primary/10 dark:bg-primary/15",
    iconColor: "text-primary",
    pillBg: "bg-primary/10 dark:bg-primary/15",
    pillText: "text-primary dark:text-primary/90",
    dot: "bg-primary",
  },
  sms: {
    label: "SMS",
    Icon: MessageSquare,
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    pillBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    pillText: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  push: {
    label: "Push",
    Icon: Bell,
    iconBg: "bg-amber-500/10 dark:bg-amber-500/15",
    iconColor: "text-amber-600 dark:text-amber-400",
    pillBg: "bg-amber-500/10 dark:bg-amber-500/15",
    pillText: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  in_app: {
    label: "In-App",
    Icon: Monitor,
    iconBg: "bg-violet-500/10 dark:bg-violet-500/15",
    iconColor: "text-violet-600 dark:text-violet-400",
    pillBg: "bg-violet-500/10 dark:bg-violet-500/15",
    pillText: "text-violet-700 dark:text-violet-400",
    dot: "bg-violet-500",
  },
  whatsapp: {
    label: "WhatsApp",
    Icon: MessageCircle,
    iconBg: "bg-green-500/10 dark:bg-green-500/15",
    iconColor: "text-green-600 dark:text-green-400",
    pillBg: "bg-green-500/10 dark:bg-green-500/15",
    pillText: "text-green-700 dark:text-green-400",
    dot: "bg-green-500",
  },
};

function normalize(channel: string): string {
  const c = channel.toLowerCase().replace(/-/g, "_");
  if (c === "in_app" || c === "inapp") return "in_app";
  return c;
}

/** Large icon box — used inside cards */
export function ChannelIconBox({ channel, className }: { channel: Channel; className?: string }) {
  const cfg = CONFIG[normalize(channel as string)] ?? CONFIG.email;
  const { Icon, iconBg, iconColor } = cfg;
  return (
    <div className={cn("flex items-center justify-center rounded-xl border border-current/10", iconBg, className)}>
      <Icon className={cn("h-4 w-4", iconColor)} />
    </div>
  );
}

/** Compact pill badge — used in lists and cards */
export function ChannelBadge({ channel, className }: { channel: Channel; className?: string }) {
  const cfg = CONFIG[normalize(channel as string)] ?? CONFIG.email;
  const { Icon, pillBg, pillText, label } = cfg;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide", pillBg, pillText, className)}>
      <Icon className="h-3 w-3 shrink-0" />
      {label}
    </span>
  );
}

/** Dot + label — used in compact rows */
export function ChannelDot({ channel, className }: { channel: Channel; className?: string }) {
  const cfg = CONFIG[normalize(channel as string)] ?? CONFIG.email;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground", className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", cfg.dot)} />
      {cfg.label}
    </span>
  );
}
