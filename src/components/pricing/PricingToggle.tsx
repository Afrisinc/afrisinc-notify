import { Badge } from "@/components/ui/badge";

interface PricingToggleProps {
  value: "monthly" | "annual";
  onChange: (value: "monthly" | "annual") => void;
  savingsPercent?: number;
}

export function PricingToggle({
  value,
  onChange,
  savingsPercent = 20,
}: PricingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span
        className={`text-sm font-medium ${value === "monthly" ? "text-foreground" : "text-muted-foreground"}`}
      >
        Monthly
      </span>
      <button
        role="switch"
        aria-checked={value === "annual"}
        onClick={() => onChange(value === "monthly" ? "annual" : "monthly")}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
          value === "annual" ? "bg-primary" : "bg-muted dark:bg-muted/60"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
            value === "annual" ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <span
        className={`text-sm font-medium ${value === "annual" ? "text-foreground" : "text-muted-foreground"}`}
      >
        Annual
      </span>
      {value === "annual" && (
        <Badge
          variant="secondary"
          className="text-xs bg-success/10 text-success border-success/20"
        >
          Save {savingsPercent}%
        </Badge>
      )}
    </div>
  );
}
