import { CheckCircle2, Lock, FileEdit, ArchiveX } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "published" | "private" | "draft" | "archived";

interface StatusConfig {
  label: string;
  Icon: React.FC<{ className?: string }>;
  bg: string;
  text: string;
  dot: string;
}

const CONFIG: Record<Status, StatusConfig> = {
  published: {
    label: "Published",
    Icon: CheckCircle2,
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  private: {
    label: "Private",
    Icon: Lock,
    bg: "bg-slate-500/10 dark:bg-slate-500/15",
    text: "text-slate-600 dark:text-slate-400",
    dot: "bg-slate-400",
  },
  draft: {
    label: "Draft",
    Icon: FileEdit,
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  archived: {
    label: "Archived",
    Icon: ArchiveX,
    bg: "bg-rose-500/10 dark:bg-rose-500/15",
    text: "text-rose-700 dark:text-rose-400",
    dot: "bg-rose-500",
  },
};

interface TemplateStatusBadgeProps {
  isPublic?: boolean;
  isActive?: boolean;
  className?: string;
}

function resolveStatus(isPublic?: boolean, isActive?: boolean): Status {
  if (!isActive) return "draft";
  if (isPublic) return "published";
  return "private";
}

export function TemplateStatusBadge({ isPublic, isActive = true, className }: TemplateStatusBadgeProps) {
  const status = resolveStatus(isPublic, isActive);
  const { label, Icon, bg, text } = CONFIG[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold", bg, text, className)}>
      <Icon className="h-3 w-3 shrink-0" />
      {label}
    </span>
  );
}

export function TemplateStatusDot({ isPublic, isActive = true, className }: TemplateStatusBadgeProps) {
  const status = resolveStatus(isPublic, isActive);
  const { label, dot } = CONFIG[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground", className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dot)} />
      {label}
    </span>
  );
}
