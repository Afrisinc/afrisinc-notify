import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Smartphone } from "lucide-react";

/**
 * Reusable payment method selector component
 * Allows user to choose between card and mobile money
 */

interface PaymentMethodSelectorProps {
  /**
   * Amount in USD (for display in summary)
   */
  chargeAmount: number;

  /**
   * Called when card is selected
   */
  onSelectCard: () => void;

  /**
   * Called when mobile is selected
   */
  onSelectMobile: () => void;

  /**
   * Back button callback
   */
  onBack: () => void;

  /**
   * Optional items to display in order summary
   */
  summaryItems?: Array<{
    label: string;
    value: string | number;
    highlight?: boolean;
    color?: "default" | "success" | "primary";
  }>;

  /**
   * Whether to show card option (default: true)
   */
  showCard?: boolean;

  /**
   * Whether to show mobile option (default: true)
   */
  showMobile?: boolean;
}

export function PaymentMethodSelector({
  chargeAmount,
  onSelectCard,
  onSelectMobile,
  onBack,
  summaryItems = [],
  showCard = true,
  showMobile = true,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-4">
      {/* Summary */}
      {(summaryItems.length > 0 || chargeAmount > 0) && (
        <div className="rounded-lg border border-border/60 divide-y divide-border/40 overflow-hidden text-sm">
          {/* Custom summary items */}
          {summaryItems.map((item, idx) => {
            const isHighlight =
              item.highlight || idx === summaryItems.length - 1;
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
                className={`flex justify-between px-3 py-${isHighlight ? "2" : "2"} ${bgClass}`}
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

          {/* Show amount as final item if no custom items */}
          {summaryItems.length === 0 && chargeAmount > 0 && (
            <div className="flex justify-between px-3 py-2 bg-muted/30 dark:bg-muted/20">
              <span className="text-content-secondary dark:text-foreground/70">
                Amount
              </span>
              <span className="font-semibold text-content dark:text-foreground">
                ${chargeAmount.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Payment method buttons */}
      <div className="space-y-2">
        {showCard && (
          <button
            onClick={onSelectCard}
            className="w-full flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/40 transition-colors text-left"
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-content dark:text-foreground">
                Credit/Debit Card
              </p>
              <p className="text-xs text-muted-foreground">
                Visa, Mastercard, American Express
              </p>
            </div>
          </button>
        )}

        {showMobile && (
          <button
            onClick={onSelectMobile}
            className="w-full flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/40 transition-colors text-left"
          >
            <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
              <Smartphone className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="font-medium text-content dark:text-foreground">
                Mobile Money
              </p>
              <p className="text-xs text-muted-foreground">
                MTN MoMo, Airtel Money
              </p>
            </div>
          </button>
        )}
      </div>

      {/* Back button */}
      <Button variant="outline" size="sm" onClick={onBack} className="gap-1.5">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Button>
    </div>
  );
}
