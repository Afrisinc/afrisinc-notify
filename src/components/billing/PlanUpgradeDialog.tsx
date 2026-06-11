import { useState } from "react";
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
import { Check, CheckCircle, ArrowLeft, Zap, Loader2 } from "lucide-react";
import {
  useUpgradePlan,
  useInitSubscriptionPayment,
  useSubscriptionConfirmation,
} from "@/hooks/usePayg";

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

type Step = "confirm" | "card" | "success" | "activating";

// ─── Card Step (inside <Elements>) ────────────────────────────────────────────

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
  const stripe = useStripe();
  const elements = useElements();
  const { mutateAsync: initPayment } = useInitSubscriptionPayment(accountId);

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  async function handlePay() {
    if (!stripe || !elements) return;
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setProcessing(true);
    setError("");

    try {
      const { clientSecret } = await initPayment({
        planId: plan.id,
        billingCycle: billing,
        customerEmail,
      });

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
        onSuccess(plan.name);
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
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [error, setError] = useState("");
  const [activatingPlan, setActivatingPlan] = useState<string | null>(null);

  const { mutateAsync: upgrade, isPending } = useUpgradePlan(accountId);
  const { confirmed, timedOut } = useSubscriptionConfirmation(
    activatingPlan,
    accountId,
  );

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

  function reset() {
    setStep("confirm");
    setBilling("monthly");
    setError("");
    setActivatingPlan(null);
  }

  function handleClose() {
    const succeeded = step === "success" || step === "activating";
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
          <DialogTitle className="text-content dark:text-white">
            {step === "confirm" && `Upgrade to ${plan.displayName}`}
            {step === "card" && "Payment Details"}
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
                plan.isPayg ? handlePaygSwitch() : setStep("card")
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

        {/* ── Step 2: Card ─────────────────────────────────────────────────── */}
        {step === "card" && (
          <Elements stripe={stripePromise}>
            <CardStep
              plan={plan}
              billing={billing}
              chargeAmount={chargeAmount}
              accountId={accountId}
              customerEmail={customerEmail}
              onBack={() => setStep("confirm")}
              onSuccess={handleCardSuccess}
            />
          </Elements>
        )}

        {/* ── Step 3: Activating (polling) ─────────────────────────────────── */}
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
