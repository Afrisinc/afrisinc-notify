import { motion } from "framer-motion";
import { ReactNode } from "react";

interface OptionButtonsProps {
  /** Array of option objects */
  options: Array<{
    id: string | number;
    label: string;
    icon?: ReactNode;
  }>;
  /** Currently selected option(s) */
  selected: string | number | (string | number)[];
  /** Callback when option is selected */
  onSelect: (id: string | number) => void;
  /** Allow multiple selections */
  multiple?: boolean;
  /** Visual variant/color scheme */
  variant?: "channel" | "category" | "pricing" | "status" | "default";
  /** Size preset */
  size?: "sm" | "md" | "lg";
  /** Responsive - show all on mobile or scroll */
  responsive?: "stack" | "scroll";
  /** Custom className for container */
  className?: string;
  /** Show as pills (rounded) or blocks */
  shape?: "pill" | "block";
  /** Full width buttons */
  fullWidth?: boolean;
}

// Channel color mapping (matches existing theme)
const channelColors: Record<string, string> = {
  email: "from-primary/10 to-primary/5 text-primary border-primary/20 hover:border-primary/40 hover:bg-primary/15",
  sms: "from-green-500/10 to-green-500/5 text-green-600 dark:text-green-400 border-green-500/20 hover:border-green-500/40 hover:bg-green-500/15",
  push: "from-amber-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/15",
  "in-app": "from-cyan-500/10 to-cyan-500/5 text-cyan-600 dark:text-cyan-400 border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-500/15",
};

// Category color mapping (semantic)
const categoryColors: Record<string, string> = {
  authentication: "from-primary/10 to-primary/5 text-primary border-primary/20 hover:border-primary/40",
  transactional: "from-blue-500/10 to-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:border-blue-500/40",
  marketing: "from-purple-500/10 to-purple-500/5 text-purple-600 dark:text-purple-400 border-purple-500/20 hover:border-purple-500/40",
  alerts: "from-orange-500/10 to-orange-500/5 text-orange-600 dark:text-orange-400 border-orange-500/20 hover:border-orange-500/40",
  ecommerce: "from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40",
};

// Pricing tier colors
const pricingColors: Record<string, string> = {
  free: "from-green-500/10 to-green-500/5 text-green-600 dark:text-green-400 border-green-500/20 hover:border-green-500/40",
  starter: "from-blue-500/10 to-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:border-blue-500/40",
  pro: "from-primary/10 to-primary/5 text-primary border-primary/20 hover:border-primary/40",
  enterprise: "from-purple-500/10 to-purple-500/5 text-purple-600 dark:text-purple-400 border-purple-500/20 hover:border-purple-500/40",
};

// Status colors
const statusColors: Record<string, string> = {
  active: "from-green-500/10 to-green-500/5 text-green-600 dark:text-green-400 border-green-500/20 hover:border-green-500/40",
  inactive: "from-gray-500/10 to-gray-500/5 text-gray-600 dark:text-gray-400 border-gray-500/20 hover:border-gray-500/40",
  pending: "from-amber-500/10 to-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:border-amber-500/40",
  archived: "from-slate-500/10 to-slate-500/5 text-slate-600 dark:text-slate-400 border-slate-500/20 hover:border-slate-500/40",
};

// Get color for variant and option id
const getColorClass = (variant: string, id: string | number): string => {
  const idStr = String(id).toLowerCase();

  if (variant === "channel") {
    return channelColors[idStr] || channelColors.email;
  } else if (variant === "category") {
    return categoryColors[idStr] || categoryColors.authentication;
  } else if (variant === "pricing") {
    return pricingColors[idStr] || pricingColors.free;
  } else if (variant === "status") {
    return statusColors[idStr] || statusColors.active;
  }

  // Default color
  return "from-primary/10 to-primary/5 text-primary border-primary/20 hover:border-primary/40 hover:bg-primary/15";
};

// Size presets
const sizePresets = {
  sm: {
    text: "text-xs",
    padding: "px-3 py-1.5",
    iconSize: "w-3 h-3",
    gap: "gap-1.5",
  },
  md: {
    text: "text-sm",
    padding: "px-4 py-2",
    iconSize: "w-4 h-4",
    gap: "gap-2",
  },
  lg: {
    text: "text-base",
    padding: "px-6 py-3",
    iconSize: "w-5 h-5",
    gap: "gap-3",
  },
};

// Shape presets
const shapePresets = {
  pill: "rounded-full",
  block: "rounded-lg",
};

export function OptionButtons({
  options,
  selected,
  onSelect,
  multiple = false,
  variant = "default",
  size = "md",
  responsive = "scroll",
  className = "",
  shape = "pill",
  fullWidth = false,
}: OptionButtonsProps) {
  const selectedArray = Array.isArray(selected) ? selected : [selected];
  const sizeClass = sizePresets[size];

  const isSelected = (id: string | number) => selectedArray.includes(id);

  return (
    <div
      className={`flex ${responsive === "stack" ? "flex-col sm:flex-row" : "flex-wrap"} gap-2 md:gap-3 ${className}`}
    >
      {options.map((option) => {
        const selected = isSelected(option.id);
        const colorClass = getColorClass(variant, option.id);

        return (
          <motion.button
            key={option.id}
            onClick={() => onSelect(option.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={`
              relative inline-flex items-center justify-center
              ${sizeClass.text} font-medium
              ${sizeClass.padding}
              ${sizeClass.gap}
              ${shapePresets[shape]}
              ${fullWidth ? "w-full" : ""}
              border transition-all duration-200
              ${
                selected
                  ? `bg-primary text-white border-primary shadow-primary hover:shadow-primary/50 hover:scale-105`
                  : `bg-gradient-to-b ${colorClass} dark:bg-gradient-to-b dark:${colorClass} hover:bg-opacity-100`
              }
              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 dark:focus:ring-offset-foreground
              cursor-pointer
              group
            `}
          >
            {option.icon && (
              <span className={sizeClass.iconSize}>
                {option.icon}
              </span>
            )}
            <span className="whitespace-nowrap">{option.label}</span>

            {/* Ripple effect on selection */}
            {selected && (
              <motion.div
                layoutId="selection-bg"
                className="absolute inset-0 rounded-full bg-primary -z-10"
                transition={{ type: "spring", stiffness: 200, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

/**
 * Usage Examples:
 *
 * // Channels - single select
 * <OptionButtons
 *   options={[
 *     { id: "all", label: "All Channels" },
 *     { id: "email", label: "Email" },
 *     { id: "sms", label: "SMS" },
 *     { id: "push", label: "Push" },
 *     { id: "in-app", label: "In-App" },
 *   ]}
 *   selected={activeChannel}
 *   onSelect={setActiveChannel}
 *   variant="channel"
 *   size="md"
 * />
 *
 * // Categories - with icons
 * <OptionButtons
 *   options={[
 *     { id: "all", label: "All", icon: <Grid className="w-4 h-4" /> },
 *     { id: "marketing", label: "Marketing", icon: <Megaphone className="w-4 h-4" /> },
 *     { id: "transactional", label: "Transactional", icon: <Mail className="w-4 h-4" /> },
 *   ]}
 *   selected={category}
 *   onSelect={setCategory}
 *   variant="category"
 *   size="md"
 *   shape="block"
 * />
 *
 * // Pricing - responsive stack on mobile
 * <OptionButtons
 *   options={[
 *     { id: "free", label: "Free" },
 *     { id: "starter", label: "Starter" },
 *     { id: "pro", label: "Pro" },
 *     { id: "enterprise", label: "Enterprise" },
 *   ]}
 *   selected={pricingTier}
 *   onSelect={setPricingTier}
 *   variant="pricing"
 *   size="lg"
 *   responsive="stack"
 *   fullWidth={true}
 * />
 *
 * // Status - multiple select
 * <OptionButtons
 *   options={[
 *     { id: "active", label: "Active" },
 *     { id: "pending", label: "Pending" },
 *     { id: "archived", label: "Archived" },
 *   ]}
 *   selected={selectedStatuses}
 *   onSelect={(id) => setSelectedStatuses(...)}
 *   variant="status"
 *   multiple={true}
 * />
 */
