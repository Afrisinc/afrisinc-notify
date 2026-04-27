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
    bg: "bg-success/10",
    text: "text-success",
    dot: "bg-success",
  },
  private: {
    label: "Private",
    Icon: Lock,
    bg: "bg-muted",
    text: "text-muted-foreground",
    dot: "bg-muted-foreground/50",
  },
  draft: {
    label: "Draft",
    Icon: FileEdit,
    bg: "bg-warning/10",
    text: "text-warning",
    dot: "bg-warning",
  },
  archived: {
    label: "Archived",
    Icon: ArchiveX,
    bg: "bg-destructive/10",
    text: "text-destructive",
    dot: "bg-destructive",
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

export function TemplateStatusBadge({
  isPublic,
  isActive = true,
  className,
}: TemplateStatusBadgeProps) {
  const status = resolveStatus(isPublic, isActive);
  const { label, Icon, bg, text } = CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold",
        bg,
        text,
        className,
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {label}
    </span>
  );
}

export function TemplateStatusDot({
  isPublic,
  isActive = true,
  className,
}: TemplateStatusBadgeProps) {
  const status = resolveStatus(isPublic, isActive);
  const { label, dot } = CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dot)} />
      {label}
    </span>
  );
}
