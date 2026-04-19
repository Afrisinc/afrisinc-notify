import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Eye, Copy, Trash2, Upload, Star, Download, Zap, Mail, MessageSquare, Bell, Smartphone, Check, Circle, AlertCircle } from "lucide-react";

interface MyTemplateCardProps {
  template: {
    id: string;
    subject: string;
    description: string;
    channel: string;
    isPublic: boolean;
    active: boolean;
    version: number;
    rating?: number;
    installs?: number;
    createdAt?: string;
  };
  onEdit: () => void;
  onView: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  isPublishing?: boolean;
}

const channelConfig: Record<string, { bg: string; text: string; Icon: React.ComponentType<{ className?: string }> }> = {
  EMAIL: { bg: "bg-primary/15 dark:bg-primary/20", text: "text-primary dark:text-primary/90", Icon: Mail },
  SMS: { bg: "bg-green-500/15 dark:bg-green-500/20", text: "text-green-600 dark:text-green-400", Icon: MessageSquare },
  PUSH: { bg: "bg-amber-500/15 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-400", Icon: Bell },
  IN_APP: { bg: "bg-blue-500/15 dark:bg-blue-500/20", text: "text-blue-600 dark:text-blue-400", Icon: Smartphone },
};

export function MyTemplateCard({
  template,
  onEdit,
  onView,
  onDuplicate,
  onDelete,
  onPublish,
  onUnpublish,
  isPublishing,
}: MyTemplateCardProps) {
  const config = channelConfig[template.channel as keyof typeof channelConfig] || channelConfig.EMAIL;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      className="group h-full"
    >
      <Card className="rounded-2xl border border-border/40 hover:border-primary/30 dark:border-border/30 dark:hover:border-primary/40 overflow-hidden transition-all duration-300 shadow-card hover:shadow-card-hover dark:hover:shadow-lg dark:shadow-black/20 flex flex-col h-full">
        {/* Status Top Border */}
        {template.isPublic && (
          <div className="h-1.5 bg-gradient-to-r from-primary via-primary to-primary/60 dark:to-primary/40" />
        )}

        <CardContent className="p-6 lg:p-7 space-y-6 flex-1 flex flex-col">
          {/* Title Section */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-content dark:text-white line-clamp-2 leading-tight">
              {template.subject}
            </h3>
            <p className="text-xs text-content-secondary dark:text-foreground/70 line-clamp-2 leading-relaxed">
              {template.description}
            </p>
          </div>

          {/* Status Badges Section */}
          <div className="space-y-3 border-t border-border/20 dark:border-border/40 pt-3">
            <div className="flex items-center flex-wrap gap-2">
              <Badge
                variant="secondary"
                className={`text-[10px] font-semibold px-3 py-1.5 ${config.bg} ${config.text} border-0 rounded-full flex items-center gap-1.5`}
              >
                <config.Icon className="h-3.5 w-3.5" />
                {template.channel}
              </Badge>

              <Badge
                variant={template.isPublic ? "default" : "secondary"}
                className={`text-[10px] font-semibold px-3 py-1.5 rounded-full border-0 flex items-center gap-1.5 ${
                  template.isPublic
                    ? "bg-green-500/20 dark:bg-green-500/25 text-green-700 dark:text-green-300"
                    : "bg-slate-500/15 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300"
                }`}
              >
                {template.isPublic ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Published
                  </>
                ) : (
                  <>
                    <Circle className="h-3.5 w-3.5" />
                    Private
                  </>
                )}
              </Badge>

              {!template.active && (
                <Badge className="text-[10px] font-semibold px-3 py-1.5 rounded-full bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-0 flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Draft
                </Badge>
              )}
            </div>
          </div>

          {/* Metrics Section (if published) */}
          {template.isPublic && (
            <div className="space-y-3 border-t border-border/20 dark:border-border/40 pt-3">
              <div className="grid grid-cols-3 gap-4">
                {template.rating && (
                  <div className="flex flex-col items-center justify-center py-2 px-2 rounded-lg bg-accent/5 dark:bg-accent/10">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400 mb-1" />
                    <span className="font-bold text-xs text-content dark:text-white">{template.rating.toFixed(1)}</span>
                    <span className="text-[10px] text-content-secondary dark:text-foreground/60">Rating</span>
                  </div>
                )}
                {template.installs !== undefined && (
                  <div className="flex flex-col items-center justify-center py-2 px-2 rounded-lg bg-primary/5 dark:bg-primary/10">
                    <Download className="h-4 w-4 text-primary mb-1" />
                    <span className="font-bold text-xs text-content dark:text-white">{(template.installs / 1000).toFixed(1)}k</span>
                    <span className="text-[10px] text-content-secondary dark:text-foreground/60">Installs</span>
                  </div>
                )}
                <div className="flex flex-col items-center justify-center py-2 px-2 rounded-lg bg-slate-500/5 dark:bg-slate-500/10">
                  <Zap className="h-4 w-4 text-slate-400 dark:text-slate-500 mb-1" />
                  <span className="font-bold text-xs text-content dark:text-white">v{template.version}</span>
                  <span className="text-[10px] text-content-secondary dark:text-foreground/60">Version</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons Section - Spacer before buttons */}
          <div className="space-y-3 border-t border-border/20 dark:border-border/40 pt-4 mt-auto">
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-1 h-9 rounded-lg"
                onClick={onEdit}
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Edit</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-1 h-9 rounded-lg"
                onClick={onView}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Preview</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-1 h-9 rounded-lg"
                onClick={onDuplicate}
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Duplicate</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-1 h-9 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </Button>
            </div>

            {/* CTA Button - Full Width */}
            {template.isPublic ? (
              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-1 h-9 rounded-lg w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={onUnpublish}
                disabled={isPublishing}
              >
                <Upload className="h-3.5 w-3.5 rotate-180" />
                Unpublish
              </Button>
            ) : (
              <Button
                size="sm"
                className="text-xs gap-1 h-9 rounded-lg w-full bg-primary hover:bg-primary/90 text-white shadow-primary/30 font-semibold"
                onClick={onPublish}
                disabled={isPublishing}
              >
                {isPublishing ? (
                  <>
                    <span className="animate-spin">⚙️</span>
                    Publishing...
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" />
                    Publish to Marketplace
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
