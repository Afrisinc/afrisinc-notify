import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Zap, Loader2, AlertCircle } from "lucide-react";
import { CardPaymentStep } from "@/components/payment/CardPaymentStep";
import { MobilePaymentStep } from "@/components/payment/MobilePaymentStep";
import { PaymentMethodSelector } from "@/components/payment/PaymentMethodSelector";
import {
  useBalanceConfirmation,
  useMobilePaymentConfirmation,
} from "@/hooks/usePayg";
import { useCardPayment, useMobilePayment } from "@/hooks/usePayment";
import { useExchangeRate } from "@/lib/exchangeRate";

// ─── Amount helpers ────────────────────────────────────────────────────────────

const PRESET_AMOUNTS = [
  { value: 0.5, bonus: 0 },
  { value: 5, bonus: 0 },
  { value: 10, bonus: 0 },
  { value: 25, bonus: 0 },
  { value: 50, bonus: 5 },
  { value: 100, bonus: 10 },
  { value: 250, bonus: 15 },
];

function getBonusPercent(amount: number) {
  if (amount >= 250) return 15;
  if (amount >= 100) return 10;
  if (amount >= 50) return 5;
  return 0;
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  accountId: string;
  currentBalance: number;
  customerEmail: string;
}

type PaymentMethod = "card" | "mobile";
type Step = "amount" | "method" | "card" | "mobile" | "pending" | "success";

// ─── Main Dialog ───────────────────────────────────────────────────────────────

export function TopUpDialog({
  open,
  onClose,
  accountId,
  currentBalance,
  customerEmail,
}: Props) {
  const [step, setStep] = useState<Step>("amount");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [selectedAmount, setSelectedAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState("");
  const [expectedBalance, setExpectedBalance] = useState<number | null>(null);
  const [mobilePaymentId, setMobilePaymentId] = useState<string | null>(null);

  const { confirmed, timedOut } = useBalanceConfirmation(
    accountId,
    step === "success" && paymentMethod === "card" ? expectedBalance : null,
  );

  const {
    confirmed: mobileConfirmed,
    failed: mobileFailed,
    timedOut: mobileTimedOut,
  } = useMobilePaymentConfirmation(
    accountId,
    step === "pending" ? mobilePaymentId : null,
    expectedBalance,
  );

  const { initCardPayment } = useCardPayment(accountId);
  const { initMobilePayment } = useMobilePayment(accountId);
  const { data: exchangeRate } = useExchangeRate();

  const amount = customAmount
    ? Number.parseFloat(customAmount) || 0
    : selectedAmount;
  const bonusPct = getBonusPercent(amount);
  const bonusAmt = Number.parseFloat(((amount * bonusPct) / 100).toFixed(2));
  const totalCredits = amount + bonusAmt;
  const balanceAfter = currentBalance + totalCredits;
  const isAmountValid = amount >= 0.5;

  const handleClose = useCallback(() => {
    setStep("amount");
    setPaymentMethod("card");
    setSelectedAmount(25);
    setCustomAmount("");
    setExpectedBalance(null);
    setMobilePaymentId(null);
    onClose();
  }, [onClose]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Zap className="h-4 w-4 text-primary" />
            {step === "amount" && "Top Up Credits"}
            {step === "method" && "Choose Payment Method"}
            {step === "card" && "Card Payment"}
            {step === "mobile" && "Mobile Money"}
            {step === "pending" && "Waiting for Payment"}
            {step === "success" && "Payment Submitted"}
          </DialogTitle>
        </DialogHeader>

        {/* ── Step 1: Amount ──────────────────────────────────────────────── */}
        {step === "amount" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 dark:bg-muted/20 px-3 py-2.5">
              <span className="text-xs text-content-secondary dark:text-foreground/70">
                Current balance
              </span>
              <span
                className={`text-sm font-semibold ${
                  currentBalance === 0
                    ? "text-destructive"
                    : currentBalance < 5
                      ? "text-warning"
                      : "text-foreground"
                }`}
              >
                ${currentBalance.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map(({ value, bonus }) => (
                <button
                  key={value}
                  onClick={() => {
                    setSelectedAmount(value);
                    setCustomAmount("");
                  }}
                  className={`relative rounded-lg border p-3 text-left transition-colors ${
                    !customAmount && selectedAmount === value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/40"
                  }`}
                >
                  <p className="font-semibold text-sm text-foreground">
                    ${value}
                  </p>
                  {bonus > 0 && (
                    <span className="absolute top-1.5 right-1.5 text-[10px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded-full">
                      +{bonus}%
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs text-content-secondary dark:text-foreground/70 mb-1.5 block">
                Custom amount (min $0.5)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-content-secondary dark:text-foreground/70 text-sm">
                  $
                </span>
                <input
                  type="number"
                  min={5}
                  placeholder="0.00"
                  className="w-full rounded-md border border-input bg-background pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
              </div>
            </div>

            {isAmountValid && (
              <div className="rounded-lg border border-border/60 divide-y divide-border/40 overflow-hidden text-sm">
                <div className="flex justify-between px-3 py-2 bg-muted/30 dark:bg-muted/20">
                  <span className="text-content-secondary dark:text-foreground/70">
                    Adding
                  </span>
                  <span className="font-medium text-content dark:text-foreground">
                    ${amount.toFixed(2)}
                  </span>
                </div>
                {bonusPct > 0 && (
                  <div className="flex justify-between px-3 py-2 bg-muted/30 dark:bg-muted/20">
                    <span className="text-success">Bonus ({bonusPct}%)</span>
                    <span className="font-medium text-success">
                      +${bonusAmt.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between px-3 py-2 bg-muted/30 dark:bg-muted/20">
                  <span className="text-content-secondary dark:text-foreground/70">
                    Current balance
                  </span>
                  <span className="text-content dark:text-foreground">
                    ${currentBalance.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between px-3 py-2.5 bg-primary/5 dark:bg-primary/10">
                  <span className="font-semibold text-content dark:text-foreground">
                    Balance after top-up
                  </span>
                  <span className="font-bold text-primary">
                    ${balanceAfter.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <Button
              className="w-full"
              disabled={!isAmountValid}
              onClick={() => setStep("method")}
            >
              Continue
            </Button>
          </div>
        )}

        {/* ── Step 2: Payment Method Selection ─────────────────────────────── */}
        {step === "method" && (
          <PaymentMethodSelector
            chargeAmount={amount}
            onSelectCard={() => setStep("card")}
            onSelectMobile={() => setStep("mobile")}
            onBack={() => setStep("amount")}
            summaryItems={[
              { label: "Amount", value: amount },
              ...(bonusPct > 0
                ? [
                    {
                      label: `Bonus (${bonusPct}%)`,
                      value: bonusAmt,
                      color: "success" as const,
                    },
                  ]
                : []),
            ]}
          />
        )}

        {/* ── Step 3a: Card (PesaPal Redirect) ──────────────────────────────── */}
        {step === "card" && (
          <CardPaymentStep
            chargeAmount={amount}
            accountId={accountId}
            customerEmail={customerEmail}
            onInitPayment={(email) =>
              initCardPayment({
                type: "payg_topup",
                amount,
                email,
              })
            }
            onSuccess={() => {
              setExpectedBalance(balanceAfter);
              setStep("success");
            }}
            onBack={() => setStep("method")}
            storageKeyPrefix="topup_pcode"
            summaryItems={[
              { label: "Amount", value: amount },
              ...(bonusPct > 0
                ? [
                    {
                      label: `Bonus (${bonusPct}%)`,
                      value: bonusAmt,
                      color: "success" as const,
                    },
                  ]
                : []),
              {
                label: "Balance after",
                value: balanceAfter,
                highlight: true,
                color: "primary" as const,
              },
            ]}
          />
        )}

        {/* ── Step 3b: Mobile Money ────────────────────────────────────────── */}
        {step === "mobile" && (
          <MobilePaymentStep
            chargeAmount={amount}
            accountId={accountId}
            customerName={customerEmail.split("@")[0]}
            exchangeRate={exchangeRate}
            onInitPayment={(phone, name) =>
              initMobilePayment({
                type: "payg_topup",
                amount,
                phoneNumber: phone,
                customerName: name,
              })
            }
            onSuccess={(paymentId) => {
              setMobilePaymentId(paymentId);
              setExpectedBalance(balanceAfter);
              setStep("pending");
            }}
            onBack={() => setStep("method")}
            summaryItems={[
              { label: "Bonus", value: bonusAmt, color: "success" as const },
              {
                label: "Balance after",
                value: balanceAfter,
                highlight: true,
                color: "primary" as const,
              },
            ]}
          />
        )}

        {/* ── Step 4: Pending (Mobile Money) ───────────────────────────────── */}
        {step === "pending" && (
          <div className="space-y-5 text-center">
            <div className="flex justify-center">
              {mobileConfirmed ? (
                <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle className="h-7 w-7 text-success" />
                </div>
              ) : mobileFailed ? (
                <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="h-7 w-7 text-destructive" />
                </div>
              ) : mobileTimedOut ? (
                <div className="h-14 w-14 rounded-full bg-warning/10 flex items-center justify-center">
                  <AlertCircle className="h-7 w-7 text-warning" />
                </div>
              ) : (
                <div className="h-14 w-14 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Loader2 className="h-7 w-7 text-yellow-600 animate-spin" />
                </div>
              )}
            </div>

            <div>
              {mobileConfirmed ? (
                <>
                  <p className="font-semibold text-lg">Payment Successful!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ${totalCredits.toFixed(2)} has been added to your balance.
                  </p>
                </>
              ) : mobileFailed ? (
                <>
                  <p className="font-semibold text-lg text-destructive">
                    Payment Failed
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    The payment was not completed. Please try again.
                  </p>
                </>
              ) : mobileTimedOut ? (
                <>
                  <p className="font-semibold text-lg text-warning">
                    Payment Taking Too Long
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    We haven't received confirmation yet. Please check your
                    phone for a pending prompt, or ensure you have sufficient
                    balance and try again.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-lg">Check your phone</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    A payment prompt has been sent to your phone. Please enter
                    your PIN to confirm the payment.
                  </p>
                  <div className="mt-3 flex justify-center">
                    <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full animate-pulse w-full" />
                    </div>
                  </div>
                </>
              )}
            </div>

            {(mobileConfirmed || mobileFailed || mobileTimedOut) && (
              <Button className="w-full" onClick={handleClose}>
                {mobileConfirmed ? "Done" : "Try Again"}
              </Button>
            )}
          </div>
        )}

        {/* ── Step 5: Success (Card) ─────────────────────────────────────── */}
        {step === "success" && (
          <div className="space-y-5 text-center">
            <div className="flex justify-center">
              <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-success" />
              </div>
            </div>

            <div>
              <p className="font-semibold text-lg">
                {confirmed ? "Balance updated!" : "Payment confirmed"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {confirmed
                  ? `$${totalCredits.toFixed(2)} has been added to your balance.`
                  : timedOut
                    ? "Credits may take a moment to reflect — refresh if needed."
                    : "Adding credits to your balance…"}
              </p>
              {!confirmed && !timedOut && (
                <div className="mt-2 flex justify-center">
                  <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full animate-pulse w-full" />
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-border/60 overflow-hidden text-sm text-left">
              <div className="flex justify-between px-3 py-2 bg-muted/30 dark:bg-muted/20">
                <span className="text-content-secondary dark:text-foreground/70">
                  Amount paid
                </span>
                <span className="text-content dark:text-foreground">
                  ${amount.toFixed(2)}
                </span>
              </div>
              {bonusPct > 0 && (
                <div className="flex justify-between px-3 py-2 bg-muted/30 dark:bg-muted/20">
                  <span className="text-success">Bonus ({bonusPct}%)</span>
                  <span className="text-success">+${bonusAmt.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between px-3 py-2.5 bg-primary/5 dark:bg-primary/10">
                <span className="font-semibold text-content dark:text-foreground">
                  {confirmed ? "Credits added" : "Credits being added"}
                </span>
                <span className="font-bold text-primary">
                  +${totalCredits.toFixed(2)}
                </span>
              </div>
            </div>

            <Button className="w-full" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
