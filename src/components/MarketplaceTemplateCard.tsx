import { Star, Download, TrendingUp, BadgeCheck, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarketplaceTemplate } from "@/data/marketplaceTemplates";
import { motion } from "framer-motion";

interface MarketplaceTemplateCardProps {
  template: MarketplaceTemplate;
  onInstall?: (template: MarketplaceTemplate) => void;
  onPreview?: (template: MarketplaceTemplate) => void;
  // Customizable labels for different contexts
  previewLabel?: string;  // "Preview" by default
  installLabel?: string;  // "Use It" or "Get $X" by default
  hoverButtonLabel?: string;  // "See Full Details" by default
}

export function MarketplaceTemplateCard({
  template,
  onInstall,
  onPreview,
  previewLabel = "Preview",
  installLabel,
  hoverButtonLabel = "See Full Details",
}: MarketplaceTemplateCardProps) {
  // Context-specific color system for notification channels
  const channelColors: Record<string, string> = {
    email: "bg-primary/15 text-primary dark:text-primary",
    sms: "bg-green-500/15 text-green-600 dark:text-green-400",
    push: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    "in-app": "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  };

  
  const channelLabels: Record<string, string> = {
    email: "Email",
    sms: "SMS",
    push: "Push",
    "in-app": "In-App",
  };

  const categoryLabels: Record<string, string> = {
    authentication: "Authentication",
    transactional: "Transactional",
    marketing: "Marketing",
    alerts: "Alerts",
    ecommerce: "E-Commerce",
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group h-full flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/15 dark:hover:shadow-primary/10 relative"
    >
      {/* Top accent line - notification delivery metaphor */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {/* Image Container - Notification Preview */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 group-hover:from-slate-100 group-hover:to-slate-150 dark:group-hover:from-slate-800 dark:group-hover:to-slate-700 transition-all duration-300">
        {/* Gradient Overlay - represents notification content */}
        {template.color && (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${template.color} opacity-25 mix-blend-overlay transition-opacity duration-300 group-hover:opacity-35`}
          />
        )}

        {/* Animated Template Image - Priority: previewUrl > previewImage > thumbnail > image > placeholder */}
        {template.previewImage || template.previewUrl || template.thumbnail || template.image ? (
          <img
            src={template.previewImage || template.previewUrl || template.thumbnail || template.image}
            alt={template.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center relative">
            {/* Animated notification icon */}
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-3"
            >
              <Sparkles className="h-10 w-10 text-primary/40 dark:text-primary/50" />
            </motion.div>
            <p className="text-xs text-content-secondary/60 font-medium">Template preview</p>
          </div>
        )}

        {/* Overlay Badges */}
        <div className="absolute inset-0 flex items-start justify-between p-3 bg-gradient-to-b from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex flex-col gap-2">
            {(template.price ?? 0) === 0 && (
              <Badge className="bg-green-500/90 text-white text-xs">Free</Badge>
            )}
            {template.creator?.verified && (
              <Badge className="bg-blue-500/90 text-white text-xs flex items-center gap-1">
                <BadgeCheck className="h-3 w-3" /> Verified
              </Badge>
            )}
          </div>
          {(template.price ?? 0) > 0 && (
            <Badge className="bg-black/70 text-white text-lg font-semibold py-1 px-3">
              ${template.price}
            </Badge>
          )}
        </div>

        {/* Quick Actions on Hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Button
            size="sm"
            variant="default"
            className="bg-white text-black hover:bg-gray-100 font-semibold shadow-lg"
            onClick={() => onPreview?.(template)}
          >
            {hoverButtonLabel}
          </Button>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex flex-1 flex-col p-4">
        {/* Channel & Category */}
        <div className="mb-2 flex items-center gap-2">
          {template.channel && (
            <Badge variant="secondary" className={channelColors[template.channel] || "bg-slate-500/20 text-slate-600"}>
              {channelLabels[template.channel] || template.channel}
            </Badge>
          )}
          {template.category && (
            <Badge variant="outline" className="text-xs">
              {categoryLabels[template.category] || template.category}
            </Badge>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-content mb-1 line-clamp-2 group-hover:text-primary transition-colors">
          {template.subject || template.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-content-secondary mb-3 line-clamp-2 flex-1">
          {template.description}
        </p>

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {template.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs text-primary dark:text-primary-light"
              >
                {tag}
              </span>
            ))}
            {template.tags.length > 2 && (
              <span className="text-xs text-content-secondary px-2 py-1">
                +{template.tags.length - 2} more
              </span>
            )}
          </div>
        )}

        {/* Creator Info */}
        {template.creator ? (
          <div className="mb-4 flex items-center gap-2 border-t border-border/30 pt-3">
            <img
              src={template.creator.avatar || "https://placehold.net/avatar-5.png"} 
              alt={template.creator.name}
              className="h-8 w-8 rounded-full ring-2 ring-border/50"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-content truncate">
                {template.creator.name}
              </p>
              {template.creator.verified && (
                <p className="text-[10px] text-primary flex items-center gap-0.5">
                  <BadgeCheck className="h-3 w-3" /> Verified Creator
                </p>
              )}
            </div>
          </div>
        ) : null}

        {/* Stats */}
        <div className="mb-4 grid grid-cols-3 gap-2 rounded-lg bg-surface-secondary/50 p-2">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-warning mb-0.5">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="text-xs font-semibold">{(template.rating ?? 0).toFixed(1)}</span>
            </div>
            <p className="text-[10px] text-content-secondary">Rating</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-primary mb-0.5">
              <Download className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">
                {((template.downloads ?? 0) / 1000).toFixed(1)}k
              </span>
            </div>
            <p className="text-[10px] text-content-secondary">Downloads</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-success mb-0.5">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">
                {((template.installs ?? 0) / 1000).toFixed(1)}k
              </span>
            </div>
            <p className="text-[10px] text-content-secondary">Installs</p>
          </div>
        </div>

        {/* Features */}
        {template.features && template.features.length > 0 && (
          <div className="mb-4 border-t border-border/30 pt-3">
            <p className="text-xs font-medium text-content-secondary mb-2 flex items-center gap-1">
              <Zap className="h-3 w-3" /> Key Features
            </p>
            <ul className="space-y-1">
              {template.features.slice(0, 2).map((feature, idx) => (
                <li
                  key={idx}
                  className="text-xs text-content-secondary flex items-center gap-2"
                >
                  <span className="h-1 w-1 rounded-full bg-primary/60" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-auto flex gap-2 pt-3 border-t border-border/20">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs font-medium hover:bg-primary/5 transition-colors"
            onClick={() => onPreview?.(template)}
          >
            {previewLabel}
          </Button>
          <Button
            size="sm"
            className="flex-1 text-xs font-semibold bg-primary hover:bg-primary/90 text-white shadow-sm group-hover:shadow-primary/30 transition-all"
            onClick={() => onInstall?.(template)}
          >
            {installLabel || ((template.price ?? 0) > 0 ? `Get $${template.price}` : "Use It")}
          </Button>
        </div>

        {/* Last Updated */}
        {template.updatedAt && (
          <p className="text-[10px] text-content-secondary text-center mt-2">
            Updated {new Date(template.updatedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </motion.div>
  );
}
