/**
 * StripeCardInput
 *
 * Reusable Stripe CardElement wrapper used across:
 *  - Registration (StepPlanConfirmation)
 *  - Organisation creation (CreateOrganizationForm)
 *  - Plan upgrade (PlanUpgradeDialog)
 *  - PAYG top-up (TopUpDialog)
 *
 * Must be rendered inside a Stripe <Elements> provider.
 */
import { useEffect, useState } from "react";
import { Lock, AlertCircle } from "lucide-react";
import { CardElement } from "@stripe/react-stripe-js";
import type { StripeCardElementChangeEvent } from "@stripe/stripe-js";
import { cn } from "@/lib/utils";

// Stripe Elements can't access CSS variables, so we use actual color values
// These match the design system colors from index.css
const STRIPE_COLORS = {
  light: {
    text: "#1a1d24", // --foreground: 220 20% 10%
    placeholder: "#6b7280", // --muted-foreground: 220 10% 46%
    invalid: "#ef4444", // --destructive: 0 72% 51%
  },
  dark: {
    text: "#e8eaed", // --foreground: 210 20% 95%
    placeholder: "#7c8491", // --muted-foreground: 215 15% 55%
    invalid: "#ef4444", // --destructive: 0 62% 50%
  },
};

function useIsDarkMode() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
}

interface StripeCardInputProps {
  /** Stripe or app-level error message to display beneath the input. */
  error?: string | null;
  /** Called when the card element value changes — useful to clear errors. */
  onChange?: (e: StripeCardElementChangeEvent) => void;
  /** Mirrors disabled state (visual only; Stripe doesn't support a disabled prop). */
  disabled?: boolean;
  className?: string;
}

export function StripeCardInput({
  error,
  onChange,
  disabled,
  className,
}: StripeCardInputProps) {
  const isDark = useIsDarkMode();
  const colors = isDark ? STRIPE_COLORS.dark : STRIPE_COLORS.light;

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "14px",
        fontFamily: "inherit",
        color: colors.text,
        "::placeholder": { color: colors.placeholder },
      },
      invalid: { color: colors.invalid },
    },
    hidePostalCode: false,
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Card field */}
      <div
        className={cn(
          "rounded-lg border border-border/60 bg-card px-3 py-3",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1",
          "transition-shadow",
          disabled && "opacity-60 pointer-events-none",
        )}
      >
        <CardElement options={cardElementOptions} onChange={onChange} />
      </div>

      {/* Inline error */}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}

      {/* Security badge */}
      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
        <Lock className="h-3 w-3 shrink-0" />
        Secured by Stripe — your card details never touch our servers
      </p>
    </div>
  );
}
