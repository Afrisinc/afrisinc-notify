import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChannelBadge, ChannelIconBox } from "@/components/ui/ChannelBadge";
import { TemplateStatusBadge } from "@/components/ui/TemplateStatusBadge";
import {
  Edit,
  Eye,
  Copy,
  Trash2,
  Upload,
  MoreHorizontal,
  Star,
  Download,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Channel } from "@/components/ui/ChannelBadge";

interface MyTemplateCardProps {
  template: {
    id: string;
    code?: string;
    name?: string;
    subject?: string;
    description: string;
    channel: string;
    isPublic?: boolean;
    active?: boolean;
    version?: number;
    rating?: number;
    installs?: number;
    createdAt?: string;
  };
  onEdit: () => void;
  onView: () => void;
  onDuplicate: () => void;
  onInstall: () => void;
  onDelete: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  isPublishing?: boolean;
}

function formatDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export function MyTemplateCard({
  template,
  onEdit,
  onView,
  onDuplicate,
  onInstall,
  onDelete,
  onPublish,
  onUnpublish,
  isPublishing,
}: MyTemplateCardProps) {
  const displayName =
    template.name || template.subject || template.code || "Untitled";
  const isPublished = template.isPublic;
  const isActive = template.active ?? true;
  const channel = template.channel as Channel;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      whileHover={{ y: -2 }}
      className="group h-full"
    >
      <Card
        className={cn(
          "rounded-2xl border overflow-hidden transition-all duration-300 flex flex-col h-full",
          "shadow-sm hover:shadow-[0_8px_24px_rgba(2,147,228,0.08)]",
          isPublished
            ? "border-primary/20 dark:border-primary/25"
            : "border-border/50 dark:border-border/30",
        )}
      >
        {/* Accent strip for published */}
        {isPublished && (
          <div className="h-[3px] bg-gradient-to-r from-primary via-primary/80 to-primary/40" />
        )}

        <CardContent className="p-5 flex flex-col gap-4 flex-1">
          {/* Header row: icon + name/code + menu */}
          <div className="flex items-start gap-3">
            <ChannelIconBox
              channel={channel}
              className="h-9 w-9 flex-shrink-0 mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-1">
                {displayName}
              </h3>
              {template.code && (
                <p className="text-[10px] font-mono text-muted-foreground/80 mt-0.5 truncate">
                  {template.code}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity -mt-0.5 -mr-1"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={onEdit} className="gap-2 text-xs">
                  <Edit className="h-3.5 w-3.5" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onView} className="gap-2 text-xs">
                  <Eye className="h-3.5 w-3.5" /> Preview
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onDuplicate}
                  className="gap-2 text-xs"
                >
                  <Copy className="h-3.5 w-3.5" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isPublished ? (
                  <DropdownMenuItem
                    onClick={onUnpublish}
                    className="gap-2 text-xs text-amber-600 dark:text-amber-400 focus:text-amber-600"
                  >
                    <Upload className="h-3.5 w-3.5 rotate-180" /> Unpublish
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={onPublish}
                    className="gap-2 text-xs text-primary focus:text-primary"
                  >
                    <Upload className="h-3.5 w-3.5" /> Publish
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="gap-2 text-xs text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Description */}
          {template.description && (
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 -mt-1">
              {template.description}
            </p>
          )}

          {/* Badges row */}
          <div className="flex flex-wrap gap-1.5">
            <ChannelBadge channel={channel} />
            <TemplateStatusBadge isPublic={isPublished} isActive={isActive} />
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground/70 border-t border-border/20 pt-3 mt-auto flex-wrap">
            {template.version && (
              <span className="font-mono font-semibold">
                v{template.version}
              </span>
            )}
            {template.createdAt && (
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {formatDate(template.createdAt)}
              </span>
            )}
            {template.installs !== undefined && template.installs > 0 && (
              <span className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                {template.installs >= 1000
                  ? `${(template.installs / 1000).toFixed(1)}k`
                  : template.installs}
              </span>
            )}
            {template.rating && (
              <span className="flex items-center gap-1 ml-auto">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {template.rating.toFixed(1)}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={onEdit}
              className="flex-1 h-8 text-xs gap-1.5 rounded-lg bg-primary/10 hover:bg-primary/15 text-primary dark:text-primary/90 border-0 shadow-none font-semibold"
              variant="secondary"
            >
              <Edit className="h-3.5 w-3.5" /> Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onInstall}
              className="flex-1 h-8 text-xs gap-1.5 rounded-lg"
            >
              <Download className="h-3.5 w-3.5" /> Install
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onView}
              className="flex-1 h-8 text-xs gap-1.5 rounded-lg"
            >
              <Eye className="h-3.5 w-3.5" /> Preview
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
