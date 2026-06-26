import { useState, useCallback } from "react";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { StripeCardInput } from "@/components/payment/StripeCardInput";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  ArrowLeft,
  Zap,
  CreditCard,
  Smartphone,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  useInitTopUp,
  useBalanceConfirmation,
  useInitMobileTopUp,
  useMobilePaymentConfirmation,
} from "@/hooks/usePayg";

// ─── Amount helpers ────────────────────────────────────────────────────────────

const PRESET_AMOUNTS = [
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

// ─── Card step — must live inside <Elements> ───────────────────────────────────

interface CardStepProps {
  amount: number;
  bonusPct: number;
  bonusAmt: number;
  balanceAfter: number;
  accountId: string;
  customerEmail: string;
  onBack: () => void;
  onSuccess: (expectedBalance: number) => void;
}

function CardStep({
  amount,
  bonusPct,
  bonusAmt,
  balanceAfter,
  accountId,
  customerEmail,
  onBack,
  onSuccess,
}: CardStepProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { mutateAsync: initTopUp } = useInitTopUp(accountId);

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  async function handlePay() {
    if (!stripe || !elements) return;
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setProcessing(true);
    setError("");

    try {
      const { clientSecret } = await initTopUp({ amount, customerEmail });

      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: { email: customerEmail },
          },
        });

      if (stripeError) {
        setError(stripeError.message ?? "Payment failed. Please try again.");
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        onSuccess(balanceAfter);
      } else {
        setError("Payment was not completed. Please try again.");
      }
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : "Payment failed. Please try again.";
      setError(msg);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Order summary */}
      <div className="rounded-lg border border-border/60 divide-y divide-border/40 overflow-hidden text-sm">
        <div className="flex justify-between px-3 py-2 bg-muted/30 dark:bg-muted/20">
          <span className="text-content-secondary dark:text-foreground/70">
            Paying
          </span>
          <span className="font-semibold text-content dark:text-foreground">
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
        <div className="flex justify-between px-3 py-2.5 bg-primary/5 dark:bg-primary/10">
          <span className="font-semibold text-content dark:text-foreground">
            Balance after
          </span>
          <span className="font-bold text-primary">
            ${balanceAfter.toFixed(2)}
          </span>
        </div>
      </div>

      <StripeCardInput
        error={error}
        onChange={() => setError("")}
        disabled={processing}
      />

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
          disabled={!stripe || processing}
          onClick={handlePay}
        >
          {processing ? "Processing…" : `Pay $${amount.toFixed(2)}`}
        </Button>
      </div>
    </div>
  );
}

// ─── Mobile Money Step ──────────────────────────────────────────────────────────

interface MobileStepProps {
  amount: number;
  bonusPct: number;
  bonusAmt: number;
  balanceAfter: number;
  accountId: string;
  customerName: string;
  onBack: () => void;
  onSuccess: (paymentId: string, expectedBalance: number) => void;
}

function MobileStep({
  amount,
  bonusPct,
  bonusAmt,
  balanceAfter,
  accountId,
  customerName,
  onBack,
  onSuccess,
}: MobileStepProps) {
  const { mutateAsync: initMobileTopUp } = useInitMobileTopUp(accountId);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // Convert USD to RWF (approximate rate)
  const rwfAmount = Math.round(amount * 1300);

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
      const result = await initMobileTopUp({
        amount: rwfAmount,
        phoneNumber: `250${cleanPhone}`, // Prepend country code
        customerName,
      });

      onSuccess(result.payment.id, balanceAfter);
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
        <div className="flex justify-between px-3 py-2 bg-muted/30 dark:bg-muted/20">
          <span className="text-content-secondary dark:text-foreground/70">
            Amount (USD)
          </span>
          <span className="font-semibold text-content dark:text-foreground">
            ${amount.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between px-3 py-2 bg-muted/30 dark:bg-muted/20">
          <span className="text-content-secondary dark:text-foreground/70">
            Amount (RWF)
          </span>
          <span className="font-semibold text-content dark:text-foreground">
            {rwfAmount.toLocaleString()} RWF
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
        <div className="flex justify-between px-3 py-2.5 bg-primary/5 dark:bg-primary/10">
          <span className="font-semibold text-content dark:text-foreground">
            Balance after
          </span>
          <span className="font-bold text-primary">
            ${balanceAfter.toFixed(2)}
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

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

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

  const { confirmed: mobileConfirmed, failed: mobileFailed } =
    useMobilePaymentConfirmation(
      accountId,
      step === "pending" ? mobilePaymentId : null,
      expectedBalance,
    );

  const amount = customAmount
    ? Number.parseFloat(customAmount) || 0
    : selectedAmount;
  const bonusPct = getBonusPercent(amount);
  const bonusAmt = Number.parseFloat(((amount * bonusPct) / 100).toFixed(2));
  const totalCredits = amount + bonusAmt;
  const balanceAfter = currentBalance + totalCredits;
  const isAmountValid = amount >= 5;

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
          <DialogTitle className="flex items-center gap-2 text-content dark:text-white">
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
                  <p className="font-semibold text-sm text-content dark:text-white">
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
                Custom amount (min $5)
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
          <div className="space-y-4">
            {/* Summary */}
            <div className="rounded-lg border border-border/60 divide-y divide-border/40 overflow-hidden text-sm">
              <div className="flex justify-between px-3 py-2 bg-muted/30 dark:bg-muted/20">
                <span className="text-content-secondary dark:text-foreground/70">
                  Amount
                </span>
                <span className="font-semibold text-content dark:text-foreground">
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
            </div>

            {/* Payment method buttons */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setPaymentMethod("card");
                  setStep("card");
                }}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-colors text-left ${
                  paymentMethod === "card"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/40"
                }`}
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

              <button
                onClick={() => {
                  setPaymentMethod("mobile");
                  setStep("mobile");
                }}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-colors text-left ${
                  paymentMethod === "mobile"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/40"
                }`}
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
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep("amount")}
              className="gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          </div>
        )}

        {/* ── Step 3a: Card (Stripe Elements) ──────────────────────────────── */}
        {step === "card" && (
          <Elements stripe={stripePromise}>
            <CardStep
              amount={amount}
              bonusPct={bonusPct}
              bonusAmt={bonusAmt}
              balanceAfter={balanceAfter}
              accountId={accountId}
              customerEmail={customerEmail}
              onBack={() => setStep("method")}
              onSuccess={(eb) => {
                setExpectedBalance(eb);
                setStep("success");
              }}
            />
          </Elements>
        )}

        {/* ── Step 3b: Mobile Money ────────────────────────────────────────── */}
        {step === "mobile" && (
          <MobileStep
            amount={amount}
            bonusPct={bonusPct}
            bonusAmt={bonusAmt}
            balanceAfter={balanceAfter}
            accountId={accountId}
            customerName={customerEmail.split("@")[0]}
            onBack={() => setStep("method")}
            onSuccess={(paymentId, eb) => {
              setMobilePaymentId(paymentId);
              setExpectedBalance(eb);
              setStep("pending");
            }}
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

            {(mobileConfirmed || mobileFailed) && (
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
