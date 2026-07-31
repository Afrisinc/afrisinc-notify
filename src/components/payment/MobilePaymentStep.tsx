import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

/**
 * Reusable mobile money payment step component
 * Used for: subscriptions, top-ups, template purchases, etc.
 */

interface MobilePaymentStepProps {
  /**
   * Amount in USD to charge
   */
  chargeAmount: number;

  /**
   * Account ID
   */
  accountId: string;

  /**
   * Customer name (extracted from email or provided separately)
   */
  customerName: string;

  /**
   * Exchange rate USD to RWF
   */
  exchangeRate: number;

  /**
   * Function to call to initiate mobile payment
   */
  onInitPayment: (
    phone: string,
    name: string,
  ) => Promise<{
    paymentRef: string;
  }>;

  /**
   * Callback when payment is initiated
   */
  onSuccess: (paymentRef: string) => void;

  /**
   * Back button callback
   */
  onBack: () => void;

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

  /**
   * Show USD amount in summary (default: true)
   */
  showUsd?: boolean;
}

export function MobilePaymentStep({
  chargeAmount,
  accountId,
  customerName,
  exchangeRate,
  onInitPayment,
  onSuccess,
  onBack,
  summaryItems = [],
  showUsd = true,
}: MobilePaymentStepProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // Convert USD to RWF using live rate
  const rwfAmount = Math.round(chargeAmount * exchangeRate);

  async function handlePay() {
    if (!phoneNumber.trim()) {
      setError("Phone number is required");
      return;
    }

    // Validate Rwandan phone number (9 digits starting with 7)
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length !== 9 || !cleanPhone.startsWith("7")) {
      setError("Enter a valid 9-digit number starting with 7");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const result = await onInitPayment(
        `250${cleanPhone}`, // Prepend country code
        customerName,
      );
      onSuccess(result.paymentRef);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to initiate payment";
      setError(msg);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Order summary */}
      <div className="rounded-lg border border-border/60 divide-y divide-border/40 overflow-hidden text-sm">
        {/* Show USD if enabled */}
        {showUsd && (
          <div className="flex justify-between px-3 py-2 bg-muted/30 dark:bg-muted/20">
            <span className="text-content-secondary dark:text-foreground/70">
              Amount (USD)
            </span>
            <span className="font-semibold text-content dark:text-foreground">
              ${chargeAmount.toFixed(2)}
            </span>
          </div>
        )}

        {/* Show RWF amount */}
        <div className="flex justify-between px-3 py-2 bg-muted/30 dark:bg-muted/20">
          <span className="text-content-secondary dark:text-foreground/70">
            Amount (RWF)
          </span>
          <span className="font-semibold text-content dark:text-foreground">
            {rwfAmount.toLocaleString()} RWF
          </span>
        </div>

        {/* Custom summary items */}
        {summaryItems.map((item) => {
          const textClass =
            item.color === "success"
              ? "text-success"
              : item.color === "primary"
                ? "text-primary"
                : "text-content dark:text-foreground";

          return (
            <div
              key={item.label}
              className="flex justify-between px-3 py-2 bg-muted/30 dark:bg-muted/20"
            >
              <span className="text-content-secondary dark:text-foreground/70">
                {item.label}
              </span>
              <span className={`font-medium ${textClass}`}>
                {typeof item.value === "number"
                  ? `$${item.value.toFixed(2)}`
                  : item.value}
              </span>
            </div>
          );
        })}

        {/* Final total */}
        <div className="flex justify-between px-3 py-2.5 bg-yellow-500/5 dark:bg-yellow-500/10">
          <span className="font-semibold text-content dark:text-foreground">
            Total to pay
          </span>
          <span className="font-bold text-yellow-600 dark:text-yellow-500">
            {rwfAmount.toLocaleString()} RWF
          </span>
        </div>
      </div>

      {/* Phone number input */}
      <div>
        <Label htmlFor="phone" className="text-sm font-medium">
          Mobile Money Number
        </Label>
        <div className="mt-1.5 flex">
          <div className="flex items-center gap-1.5 px-3 border border-r-0 border-input rounded-l-md bg-muted/50 text-sm text-muted-foreground">
            <span className="text-base">🇷🇼</span>
            <span>+250</span>
          </div>
          <Input
            id="phone"
            type="tel"
            placeholder="78 123 4567"
            className="rounded-l-none"
            value={phoneNumber}
            onChange={(e) => {
              // Only allow digits
              const value = e.target.value.replace(/\D/g, "");
              setPhoneNumber(value);
              setError("");
            }}
            disabled={processing}
            maxLength={9}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          MTN MoMo or Airtel Money
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
        <Button
          className="flex-1"
          disabled={processing || !phoneNumber.trim()}
          onClick={handlePay}
        >
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Initiating...
            </>
          ) : (
            `Pay ${rwfAmount.toLocaleString()} RWF`
          )}
        </Button>
      </div>
    </div>
  );
}
