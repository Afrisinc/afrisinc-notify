import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

/**
 * Reusable PesaPal card payment step component
 * Used for: subscriptions, top-ups, template purchases, etc.
 */

interface CardPaymentStepProps {
  /**
   * Amount in USD to charge
   */
  chargeAmount: number;

  /**
   * Account ID for localStorage and tracking
   */
  accountId: string;

  /**
   * Customer email
   */
  customerEmail: string;

  /**
   * Function to call to initiate payment
   * Should return { checkoutUrl: string; pcode: string }
   */
  onInitPayment: (email: string) => Promise<{
    checkoutUrl: string;
    pcode: string;
  }>;

  /**
   * Callback when payment is initiated (before redirect)
   */
  onSuccess: () => void;

  /**
   * Back button callback
   */
  onBack: () => void;

  /**
   * Optional storage key prefix for PCODE (default: "payment_pcode")
   */
  storageKeyPrefix?: string;

  /**
   * Optional title for the info section
   */
  infoTitle?: string;

  /**
   * Optional description for the info section
   */
  infoDescription?: string;

  /**
   * Optional items to display in order summary
   * E.g., [{ label: "Plan", value: "Pro" }, { label: "Billing", value: "Annual" }]
   */
  summaryItems?: Array<{
    label: string;
    value: string | number;
    highlight?: boolean;
    color?: "default" | "success" | "primary";
  }>;
}

export function CardPaymentStep({
  chargeAmount,
  accountId,
  customerEmail,
  onInitPayment,
  onSuccess,
  onBack,
  storageKeyPrefix = "payment_pcode",
  infoTitle = "You'll be redirected to PesaPal",
  infoDescription = "Securely complete your card payment with Visa, Mastercard, or American Express.",
  summaryItems = [],
}: CardPaymentStepProps) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  async function handlePay() {
    setProcessing(true);
    setError("");

    try {
      // Call the payment initialization function
      const { checkoutUrl, pcode } = await onInitPayment(customerEmail);

      // Store PCODE for optional fallback polling
      localStorage.setItem(`${storageKeyPrefix}_${accountId}`, pcode);

      // Trigger the success callback (state change)
      onSuccess();

      // Redirect to PesaPal checkout
      // After redirect, customer completes payment on PesaPal
      // → PesaPal confirms to africnc-pay
      // → africnc-pay sends webhook (card.payment_succeeded)
      // → Payment activates automatically via webhook
      window.location.href = checkoutUrl;
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : "Payment initiation failed. Please try again.";
      setError(msg);
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Order summary */}
      <div className="rounded-lg border border-border/60 divide-y divide-border/40 overflow-hidden text-sm">
        {/* Default items (always show charge amount) */}
        {summaryItems.length === 0 && (
          <div className="flex justify-between px-3 py-2.5 bg-primary/5 dark:bg-primary/10">
            <span className="font-semibold text-content dark:text-foreground">
              Total charge
            </span>
            <span className="font-bold text-primary">
              ${chargeAmount.toFixed(2)}
            </span>
          </div>
        )}

        {/* Custom summary items */}
        {summaryItems.map((item, idx) => {
          const isHighlight = item.highlight || idx === summaryItems.length - 1;
          const bgClass = isHighlight
            ? "bg-primary/5 dark:bg-primary/10"
            : "bg-muted/30 dark:bg-muted/20";
          const textClass =
            item.color === "success"
              ? "text-success"
              : item.color === "primary"
                ? "text-primary"
                : "text-content dark:text-foreground";

          return (
            <div
              key={item.label}
              className={`flex justify-between px-3 py-${isHighlight ? "2.5" : "2"} ${bgClass}`}
            >
              <span
                className={`${
                  isHighlight ? "font-semibold" : ""
                } text-content-secondary dark:text-foreground/70`}
              >
                {item.label}
              </span>
              <span
                className={`${isHighlight ? "font-bold" : "font-medium"} ${textClass}`}
              >
                {typeof item.value === "number"
                  ? `$${item.value.toFixed(2)}`
                  : item.value}
              </span>
            </div>
          );
        })}

        {/* Show charge amount as final item if custom items provided */}
        {summaryItems.length > 0 && (
          <div className="flex justify-between px-3 py-2.5 bg-primary/5 dark:bg-primary/10">
            <span className="font-semibold text-content dark:text-foreground">
              Charged today
            </span>
            <span className="font-bold text-primary">
              ${chargeAmount.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Info: PesaPal redirect */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-3 text-sm">
        <p className="text-blue-900 dark:text-blue-300 font-medium">
          {infoTitle}
        </p>
        <p className="text-blue-800 dark:text-blue-400 text-xs mt-1">
          {infoDescription}
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          disabled={processing}
          className="gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Button>
        <Button className="flex-1" disabled={processing} onClick={handlePay}>
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing…
            </>
          ) : (
            `Pay $${chargeAmount.toFixed(2)}`
          )}
        </Button>
      </div>
    </div>
  );
}
