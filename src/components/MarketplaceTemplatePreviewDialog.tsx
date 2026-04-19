import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Star, Download, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { MarketplaceTemplate } from "@/data/marketplaceTemplates";

interface MarketplaceTemplatePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: MarketplaceTemplate | null;
  onAction?: (template: MarketplaceTemplate) => void;
  actionLabel?: string;
  variant?: "dashboard" | "public";
}

export function MarketplaceTemplatePreviewDialog({
  open,
  onOpenChange,
  template,
  onAction,
  actionLabel = "Use This Template",
  variant = "public",
}: MarketplaceTemplatePreviewDialogProps) {
  if (!template) return null;

  const isDashboard = variant === "dashboard";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl">
        {/* Header - Professional styling for both variants */}
        <div className="space-y-2 pb-4 border-b border-border/20">
          <DialogHeader className="space-y-0">
            <div className="flex items-start gap-3">
              <div className={`${isDashboard ? "w-1 h-10" : "w-1 h-10"} bg-gradient-to-b from-primary via-primary to-primary/50 rounded-full mt-0.5`} />
              <div className="space-y-1.5 flex-1">
                <DialogTitle className={`${isDashboard ? "text-2xl" : "text-2xl"} font-bold text-content dark:text-white`}>
                  {template.subject || template.name}
                </DialogTitle>
                <DialogDescription className={`${isDashboard ? "text-sm" : "text-sm"} text-content-secondary dark:text-foreground/70`}>
                  {template.description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="space-y-5">
          {/* Preview Image - Priority: previewUrl > previewImage > thumbnail > image > placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: isDashboard ? 0.98 : 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: isDashboard ? 0.3 : 0 }}
            className={`relative ${isDashboard ? "h-64 rounded-2xl" : "h-64 rounded-lg"} overflow-hidden shadow-sm`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700`} />
            {template.color && (
              <div
                className={`absolute inset-0 bg-gradient-to-br ${template.color} ${isDashboard ? "opacity-35" : "opacity-30"} mix-blend-multiply`}
              />
            )}
            {template.previewUrl || template.previewImage || template.thumbnail || template.image ? (
              <img
                src={template.previewUrl || template.previewImage || template.thumbnail || template.image}
                alt={template.subject || template.name}
                className="relative h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 z-10"
              />
            ) : (
              <div className="relative z-10 h-full w-full flex flex-col items-center justify-center gap-3">
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className={`${isDashboard ? "h-12 w-12" : "h-8 w-8"} text-primary/40 dark:text-primary/50`} />
                </motion.div>
                <p className={`${isDashboard ? "text-sm" : "text-xs"} text-content-secondary/60 dark:text-foreground/50 font-medium`}>
                  Template preview unavailable
                </p>
              </div>
            )}
          </motion.div>

          {/* Preview Content */}
          <div className={`${isDashboard ? "bg-surface-secondary/50 dark:bg-card/50 border border-border/20 dark:border-border/40 rounded-xl p-5" : "bg-card border border-border/50 rounded-lg p-4"} space-y-4`}>
            {template.preview?.subject && (
              <div className="space-y-2">
                <p className={`text-xs font-bold ${isDashboard ? "text-content-secondary dark:text-foreground/60" : "text-content-secondary"} uppercase tracking-wider`}>
                  {isDashboard ? "Subject Line" : "Subject"}
                </p>
                <p className={`${isDashboard ? "text-base text-content dark:text-white font-semibold bg-card dark:bg-background/50 rounded-lg px-3 py-2" : "text-sm text-content font-medium"}`}>
                  {template.preview.subject}
                </p>
              </div>
            )}
            {template.preview?.content && (
              <div className="space-y-2">
                <p className={`text-xs font-bold ${isDashboard ? "text-content-secondary dark:text-foreground/60" : "text-content-secondary"} uppercase tracking-wider`}>
                  {isDashboard ? "Preview" : "Preview"}
                </p>
                <p className={`${isDashboard ? "text-sm text-content-secondary dark:text-foreground/75 leading-relaxed bg-card dark:bg-background/50 rounded-lg px-3 py-2 italic" : "text-sm text-content"}`}>
                  {isDashboard ? `"${template.preview.content}"` : template.preview.content}
                </p>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className={`grid grid-cols-3 gap-3`}>
            {isDashboard ? (
              <>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-surface-secondary/50 dark:bg-card/50 border border-border/20 dark:border-border/40 rounded-xl p-4 text-center space-y-2 transition-all"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Star className="h-5 w-5 fill-warning text-warning" />
                    <span className="font-bold text-lg text-content dark:text-white">{(template.rating ?? 0).toFixed(1)}</span>
                  </div>
                  <p className="text-xs font-semibold text-content-secondary dark:text-foreground/60 uppercase">Community Rating</p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-surface-secondary/50 dark:bg-card/50 border border-border/20 dark:border-border/40 rounded-xl p-4 text-center space-y-2 transition-all"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Download className="h-5 w-5 text-primary" />
                    <span className="font-bold text-lg text-content dark:text-white">
                      {(((template.downloads ?? 0) / 1000).toFixed(1))}k
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-content-secondary dark:text-foreground/60 uppercase">Downloads</p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-surface-secondary/50 dark:bg-card/50 border border-border/20 dark:border-border/40 rounded-xl p-4 text-center space-y-2 transition-all"
                >
                  <div className="flex items-center justify-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-bold text-lg text-content dark:text-white">
                      {(((template.installs ?? 0) / 1000).toFixed(1))}k
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-content-secondary dark:text-foreground/60 uppercase">Active Installs</p>
                </motion.div>
              </>
            ) : (
              <>
                <div className="bg-surface-secondary/50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-warning mb-1">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-semibold">{(template.rating ?? 0).toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-content-secondary">Rating</p>
                </div>
                <div className="bg-surface-secondary/50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-primary mb-1">
                    <Download className="h-4 w-4" />
                    <span className="font-semibold">
                      {(((template.downloads ?? 0) / 1000).toFixed(1))}k
                    </span>
                  </div>
                  <p className="text-xs text-content-secondary">Downloads</p>
                </div>
                <div className="bg-surface-secondary/50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-success mb-1">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-semibold">
                      {(((template.installs ?? 0) / 1000).toFixed(1))}k
                    </span>
                  </div>
                  <p className="text-xs text-content-secondary">Installs</p>
                </div>
              </>
            )}
          </div>

          {/* Creator Info */}
          {isDashboard ? (
            <div className="bg-surface-secondary/50 dark:bg-card/50 border border-border/20 dark:border-border/40 rounded-xl p-4 flex items-center gap-3">
              {template.creator ? (
                <>
                  <img
                    src={template.creator.avatar || "https://via.placeholder.com/48"}
                    alt={template.creator.name}
                    className="h-12 w-12 rounded-full border-2 border-primary/20"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-content dark:text-white">
                      {template.creator.name}
                    </p>
                    {template.creator.verified && (
                      <p className="text-xs text-primary dark:text-primary/90 font-medium flex items-center gap-1">
                        ✓ Verified Creator
                      </p>
                    )}
                  </div>
                  {(template.price ?? 0) > 0 && (
                    <Badge className="bg-primary/10 text-primary dark:text-primary/90 font-bold border border-primary/20">
                      ${template.price}
                    </Badge>
                  )}
                </>
              ) : null}
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-surface-secondary/50 rounded-lg p-3">
              {template.creator ? (
                <>
                  <img
                    src={template.creator.avatar || "https://via.placeholder.com/40"}
                    alt={template.creator.name}
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-content">
                      {template.creator.name}
                    </p>
                    {template.creator.verified && (
                      <p className="text-xs text-primary flex items-center gap-1">
                        ✓ Verified Creator
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-content-secondary">Unknown Creator</p>
              )}
              {(template.price ?? 0) > 0 && (
                <Badge className="bg-primary text-white font-semibold">
                  ${template.price}
                </Badge>
              )}
            </div>
          )}

          {/* Features */}
          {template.features && (
            <div className={isDashboard ? "space-y-3" : ""}>
              {isDashboard ? (
                <>
                  <p className="text-xs font-bold text-content-secondary dark:text-foreground/60 uppercase tracking-wider">
                    What's Included
                  </p>
                  <div className="bg-surface-secondary/50 dark:bg-card/50 border border-border/20 dark:border-border/40 rounded-xl p-4 space-y-2.5">
                    {template.features.slice(0, 4).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <p className="text-sm text-content-secondary dark:text-foreground/75 font-medium">{feature}</p>
                      </div>
                    ))}
                    {template.features.length > 4 && (
                      <p className="text-xs text-content-secondary/60 dark:text-foreground/50 pt-1 italic">
                        +{template.features.length - 4} more features included
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Label className="text-xs font-semibold mb-2 block">Key Features</Label>
                  <ul className="space-y-1">
                    {template.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-content-secondary flex items-center gap-2"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className={`flex gap-2 pt-2 border-t ${isDashboard ? "border-border/20" : "border-border/30 dark:border-border/40"}`}>
            <Button
              variant="outline"
              size="default"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              {isDashboard ? "Close" : "Back"}
            </Button>
            {onAction && (
              <Button
                variant="premium-action"
                size="default"
                onClick={() => {
                  onAction(template);
                  onOpenChange(false);
                }}
                className={isDashboard ? "" : "flex-1 gap-2"}
              >
                {isDashboard
                  ? template.price > 0
                    ? `Get for $${template.price}`
                    : "Install Template"
                  : <>
                      {(template.price ?? 0) > 0 ? `Get $${template.price}` : actionLabel}
                      {!isDashboard && <ArrowRight className="h-4 w-4" />}
                    </>
                }
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
