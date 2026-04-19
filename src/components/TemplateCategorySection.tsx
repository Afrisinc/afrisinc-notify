import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface TemplateCategorySectionProps {
  category: string;
  title: string;
  description: string;
  onViewCategory?: () => void;
  count?: number;
}

const categoryDescriptions: Record<string, string> = {
  transactional: "Order confirmations, receipts, and account updates—the messages your users count on.",
  marketing: "Campaigns that get opened. Built for clicks, optimized for conversions.",
  security: "Password resets, 2FA codes, and security alerts. Built to protect.",
  authentication: "Welcome sequences and onboarding flows that get people started.",
  ecommerce: "From abandoned carts to post-purchase delight. Close more sales.",
  alerts: "System incidents to uptime notifications. Keep your users in the loop.",
};

export function TemplateCategorySection({
  category,
  title,
  description,
  onViewCategory,
  count,
}: TemplateCategorySectionProps) {
  const displayDescription = description || categoryDescriptions[category] || description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Category Header */}
      <div className="flex items-start justify-between gap-8">
        <div className="space-y-3 flex-1">
          {/* Category accent indicator */}
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-primary via-primary to-primary/50 rounded-full" />
            <h2 className="text-3xl md:text-4xl font-bold text-content">{title}</h2>
          </div>
          <p className="text-base text-content-secondary max-w-2xl leading-relaxed">{displayDescription}</p>
          {count && (
            <p className="text-xs font-semibold text-primary/70 uppercase tracking-wide">
              {count} {count === 1 ? "template" : "templates"}
            </p>
          )}
        </div>

        {/* View Category Link */}
        {onViewCategory && (
          <motion.button
            whileHover={{ x: 4 }}
            onClick={onViewCategory}
            className="hidden md:flex items-center gap-2 text-primary hover:text-primary/90 font-semibold transition-colors group whitespace-nowrap"
          >
            Explore All
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </motion.button>
        )}
      </div>

      {/* Mobile View Category Button */}
      {onViewCategory && (
        <div className="md:hidden">
          <Button
            className="w-full gap-2 bg-primary hover:bg-primary/90 text-white"
            onClick={onViewCategory}
          >
            Explore Category
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Divider - premium accent */}
      <div className="flex items-center gap-3 pt-2">
        <div className="h-px bg-gradient-to-r from-border via-primary/20 to-transparent flex-1" />
      </div>
    </motion.div>
  );
}
