import { useState } from "react";
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
  Check,
  CheckCircle,
  ArrowLeft,
  Zap,
  Loader2,
  CreditCard,
  Smartphone,
  AlertCircle,
} from "lucide-react";
import {
  useUpgradePlan,
  useInitSubscriptionPayment,
  useSubscriptionConfirmation,
  useInitMobileTopUp,
  useMobilePaymentConfirmation,
} from "@/hooks/usePayg";
import { useExchangeRate } from "@/lib/exchangeRate";

export interface PlanOption {
  id: string;
  name: string;
  displayName: string;
  monthlyPrice: number; // USD per month when billed monthly
  yearlyPrice: number; // USD per month when billed yearly (monthly-equivalent)
  annualNote?: string;
  features: string[];
  isPayg?: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called after dialog closes on a successful upgrade.
   *  isPayg=true → caller should open the top-up flow */
  onSuccess?: (isPayg: boolean) => void;
  plan: PlanOption;
  accountId: string;
  customerEmail: string;
  currentPlan?: string;
}

type PaymentMethod = "card" | "mobile";
type Step =
  | "confirm"
  | "method"
  | "card"
  | "mobile"
  | "pending"
  | "success"
  | "activating";

// ─── Card Step (PesaPal Redirect) ────────────────────────────────────────────

interface CardStepProps {
  plan: PlanOption;
  billing: "monthly" | "yearly";
  chargeAmount: number; // total charge in USD
  accountId: string;
  customerEmail: string;
  onBack: () => void;
  onSuccess: (planName: string) => void;
}

function CardStep({
  plan,
  billing,
  chargeAmount,
  accountId,
  customerEmail,
  onBack,
  onSuccess,
}: CardStepProps) {
  const { mutateAsync: initPayment } = useInitSubscriptionPayment(accountId);

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  async function handlePay() {
    setProcessing(true);
    setError("");

    try {
      // Get checkout URL from africnc-pay (ITEC PesaPal)
      const { checkoutUrl, pcode } = await initPayment({
        planId: plan.id,
        billingCycle: billing,
        customerEmail,
      });

      // Store PCODE for optional fallback polling
      localStorage.setItem(`payment_pcode_${accountId}`, pcode);

      // Redirect to PesaPal checkout
      window.location.href = checkoutUrl;

      // After redirect, customer completes payment on PesaPal
      // → PesaPal confirms to africnc-pay
      // → africnc-pay sends webhook (card.payment_succeeded)
      // → Subscription activates automatically via webhook
      onSuccess(plan.name);
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : "Payment initiation failed. Please try again.";
      setError(msg);
      setProcessing(false);
    }
  }

  const displayMonthly =
    billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  const annualSavings = (plan.monthlyPrice - plan.yearlyPrice) * 12;

  return (
    <div className="space-y-4">
      {/* Order summary */}
      <div className="rounded-lg border border-border/60 divide-y divide-border/40 overflow-hidden text-sm">
        <div className="flex justify-between px-3 py-2 bg-muted/30 dark:bg-muted/20">
          <span className="text-content-secondary dark:text-foreground/70">
            {plan.displayName} · {billing === "monthly" ? "monthly" : "annual"}
          </span>
          <span className="text-content-secondary dark:text-foreground/70">
            ${displayMonthly.toFixed(2)}/mo
          </span>
        </div>
        {billing === "yearly" && annualSavings > 0 && (
          <div className="flex justify-between px-3 py-2 bg-muted/30 dark:bg-muted/20">
            <span className="text-success">Annual discount</span>
            <span className="font-medium text-success">
              Save ${annualSavings.toFixed(0)}/yr
            </span>
          </div>
        )}
        <div className="flex justify-between px-3 py-2.5 bg-primary/5 dark:bg-primary/10">
          <span className="font-semibold text-content dark:text-foreground">
            Charged today ({billing === "yearly" ? "12 months" : "1 month"})
          </span>
          <span className="font-bold text-primary">
            ${chargeAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Info: PesaPal redirect */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-3 text-sm">
        <p className="text-blue-900 dark:text-blue-300 font-medium">
          You'll be redirected to PesaPal
        </p>
        <p className="text-blue-800 dark:text-blue-400 text-xs mt-1">
          Securely complete your card payment with Visa, Mastercard, or American
          Express.
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

// ─── Mobile Money Step ──────────────────────────────────────────────────────────

interface MobileStepProps {
  plan: PlanOption;
  billing: "monthly" | "yearly";
  chargeAmount: number;
  accountId: string;
  customerName: string;
  exchangeRate: number;
  onBack: () => void;
  onSuccess: (paymentId: string, planName: string) => void;
}

function MobileStep({
  plan,
  billing,
  chargeAmount,
  accountId,
  customerName,
  exchangeRate,
  onBack,
  onSuccess,
}: MobileStepProps) {
  const { mutateAsync: initMobileTopUp } = useInitMobileTopUp(accountId);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const rwfAmount = Math.round(chargeAmount * exchangeRate);

  const displayMonthly =
    billing === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
  const annualSavings = (plan.monthlyPrice - plan.yearlyPrice) * 12;

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
        phoneNumber: `250${cleanPhone}`,
        customerName,
        paymentType: "subscription",
        planId: plan.id,
        billingCycle: billing,
      });

      onSuccess(result.payment.id, plan.name);
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
            {plan.displayName} · {billing === "monthly" ? "monthly" : "annual"}
          </span>
          <span className="text-content-secondary dark:text-foreground/70">
            ${displayMonthly.toFixed(2)}/mo
          </span>
        </div>
        {billing === "yearly" && annualSavings > 0 && (
          <div className="flex justify-between px-3 py-2 bg-muted/30 dark:bg-muted/20">
            <span className="text-success">Annual discount</span>
            <span className="font-medium text-success">
              Save ${annualSavings.toFixed(0)}/yr
            </span>
          </div>
        )}
        <div className="flex justify-between px-3 py-2 bg-muted/30 dark:bg-muted/20">
          <span className="text-content-secondary dark:text-foreground/70">
            Amount (RWF)
          </span>
          <span className="font-semibold text-content dark:text-foreground">
            {rwfAmount.toLocaleString()} RWF
          </span>
        </div>
        <div className="flex justify-between px-3 py-2.5 bg-primary/5 dark:bg-primary/10">
          <span className="font-semibold text-content dark:text-foreground">
            Charged today ({billing === "yearly" ? "12 months" : "1 month"})
          </span>
          <span className="font-bold text-primary">
            ${chargeAmount.toFixed(2)}
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

// ─── Activating Step — polls until plan confirmed ──────────────────────────────

function ActivatingStep({
  planName,
  confirmed,
  timedOut,
  onDone,
}: {
  planName: string;
  confirmed: boolean;
  timedOut: boolean;
  onDone: () => void;
}) {
  return (
    <div className="space-y-5 text-center">
      <div className="flex justify-center">
        {confirmed ? (
          <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle className="h-7 w-7 text-success" />
          </div>
        ) : (
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="h-7 w-7 text-primary animate-spin" />
          </div>
        )}
      </div>

      <div>
        <p className="font-semibold text-content text-lg">
          {confirmed
            ? `You're on ${planName}!`
            : timedOut
              ? "Plan activating…"
              : "Activating your plan…"}
        </p>
        <p className="text-sm text-content-secondary mt-1">
          {confirmed
            ? "Your plan is now active. All features are available immediately."
            : timedOut
              ? "Payment received — your plan will activate shortly. Refresh if it takes longer."
              : "Payment confirmed. Waiting for plan activation…"}
        </p>
      </div>

      {(confirmed || timedOut) && (
        <Button className="w-full" onClick={onDone}>
          Done
        </Button>
      )}
    </div>
  );
}

// ─── Main Dialog ───────────────────────────────────────────────────────────────

export function PlanUpgradeDialog({
  open,
  onClose,
  onSuccess,
  plan,
  accountId,
  customerEmail,
}: Props) {
  const [step, setStep] = useState<Step>("confirm");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [error, setError] = useState("");
  const [activatingPlan, setActivatingPlan] = useState<string | null>(null);
  const [mobilePaymentId, setMobilePaymentId] = useState<string | null>(null);

  const { mutateAsync: upgrade, isPending } = useUpgradePlan(accountId);
  const { confirmed, timedOut } = useSubscriptionConfirmation(
    activatingPlan,
    accountId,
  );

  const { confirmed: mobileConfirmed, failed: mobileFailed } =
    useMobilePaymentConfirmation(
      accountId,
      step === "pending" ? mobilePaymentId : null,
      null, // No expected balance for subscriptions
    );

  const { data: exchangeRate } = useExchangeRate();

  // Yearly: charge price_yearly * 12; Monthly: charge price_monthly
  const chargeAmount =
    billing === "yearly" ? plan.yearlyPrice * 12 : plan.monthlyPrice;

  const annualSavings = (plan.monthlyPrice - plan.yearlyPrice) * 12;

  async function handlePaygSwitch() {
    setError("");
    try {
      await upgrade({ plan: plan.name, billingCycle: "monthly" });
      setStep("success");
    } catch (e: any) {
      setError(
        e?.response?.data?.message ?? e?.message ?? "Something went wrong.",
      );
    }
  }

  function handleCardSuccess(planName: string) {
    setActivatingPlan(planName);
    setStep("activating");
  }

  function handleMobileSuccess(paymentId: string, planName: string) {
    setMobilePaymentId(paymentId);
    setActivatingPlan(planName);
    setStep("pending");
  }

  function reset() {
    setStep("confirm");
    setPaymentMethod("card");
    setBilling("monthly");
    setError("");
    setActivatingPlan(null);
    setMobilePaymentId(null);
  }

  function handleClose() {
    const succeeded =
      step === "success" ||
      step === "activating" ||
      (step === "pending" && mobileConfirmed);
    reset();
    onClose();
    if (succeeded) onSuccess?.(!!plan.isPayg);
  }

  function handleTopUpNow() {
    reset();
    onClose();
    onSuccess?.(true);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {step === "confirm" && `Upgrade to ${plan.displayName}`}
            {step === "method" && "Choose Payment Method"}
            {step === "card" && "Card Payment"}
            {step === "mobile" && "Mobile Money"}
            {step === "pending" && "Waiting for Payment"}
            {step === "activating" && "Activating Plan"}
            {step === "success" && "You're all set!"}
          </DialogTitle>
        </DialogHeader>

        {/* ── Step 1: Confirm ────────────────────────────────────────────── */}
        {step === "confirm" && (
          <div className="space-y-5">
            {!plan.isPayg && plan.monthlyPrice > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 dark:bg-muted/20 p-3">
                <span className="text-sm text-content-secondary dark:text-foreground/70">
                  Billing cycle
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBilling("monthly")}
                    className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${billing === "monthly" ? "bg-primary text-primary-foreground" : "text-content-secondary hover:text-content"}`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBilling("yearly")}
                    className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${billing === "yearly" ? "bg-primary text-primary-foreground" : "text-content-secondary hover:text-content"}`}
                  >
                    Annual
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              {plan.isPayg ? (
                <>
                  <span className="text-3xl font-bold text-content">
                    Credits
                  </span>
                  <p className="text-xs text-content-secondary mt-1">
                    Pay only for what you send. No monthly commitment.
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-content">
                      $
                      {billing === "yearly"
                        ? plan.yearlyPrice.toFixed(2)
                        : plan.monthlyPrice.toFixed(2)}
                    </span>
                    <span className="text-sm text-content-secondary">/mo</span>
                  </div>
                  {billing === "yearly" && (
                    <p className="text-xs text-content-secondary mt-0.5">
                      Billed as{" "}
                      <span className="font-semibold text-content">
                        ${(plan.yearlyPrice * 12).toFixed(2)}
                      </span>{" "}
                      annually
                      {annualSavings > 0 && (
                        <span className="text-success ml-1">
                          · Save ${annualSavings.toFixed(0)}/yr
                        </span>
                      )}
                    </p>
                  )}
                </>
              )}
            </div>

            <ul className="space-y-2">
              {plan.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-sm text-content"
                >
                  <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            {error && (
              <p className="text-xs text-danger bg-danger/5 border border-danger/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button
              className="w-full"
              onClick={() =>
                plan.isPayg ? handlePaygSwitch() : setStep("method")
              }
              disabled={isPending}
            >
              {plan.isPayg
                ? isPending
                  ? "Switching…"
                  : "Switch to Pay-as-you-go"
                : "Continue to Payment"}
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
                  {plan.displayName} ·{" "}
                  {billing === "monthly" ? "monthly" : "annual"}
                </span>
                <span className="font-semibold text-content dark:text-foreground">
                  ${chargeAmount.toFixed(2)}
                </span>
              </div>
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
              onClick={() => setStep("confirm")}
              className="gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          </div>
        )}

        {/* ── Step 3a: Card (PesaPal Redirect) ──────────────────────────────── */}
        {step === "card" && (
          <CardStep
            plan={plan}
            billing={billing}
            chargeAmount={chargeAmount}
            accountId={accountId}
            customerEmail={customerEmail}
            onBack={() => setStep("method")}
            onSuccess={handleCardSuccess}
          />
        )}

        {/* ── Step 3b: Mobile Money ────────────────────────────────────────── */}
        {step === "mobile" && (
          <MobileStep
            plan={plan}
            billing={billing}
            chargeAmount={chargeAmount}
            accountId={accountId}
            customerName={customerEmail.split("@")[0]}
            exchangeRate={exchangeRate}
            onBack={() => setStep("method")}
            onSuccess={handleMobileSuccess}
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
                    Your {plan.displayName} plan is now being activated.
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

        {/* ── Step 5: Activating (polling) ─────────────────────────────────── */}
        {step === "activating" && activatingPlan && (
          <ActivatingStep
            planName={activatingPlan}
            confirmed={confirmed}
            timedOut={timedOut}
            onDone={handleClose}
          />
        )}

        {/* ── Step 4: PAYG success ─────────────────────────────────────────── */}
        {step === "success" && (
          <div className="space-y-5 text-center">
            <div className="flex justify-center">
              <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-success" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-content text-lg">
                Switched to Pay-as-you-go
              </p>
              <p className="text-sm text-content-secondary mt-1">
                Add credits now to start sending messages.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button className="w-full gap-1.5" onClick={handleTopUpNow}>
                <Zap className="h-4 w-4" /> Top Up Now
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-content-secondary"
                onClick={handleClose}
              >
                Do it later
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
