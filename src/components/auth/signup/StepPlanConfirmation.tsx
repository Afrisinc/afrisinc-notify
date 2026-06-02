import { useState } from "react";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { StripeCardInput } from "@/components/payment/StripeCardInput";
import { Link } from "react-router-dom";
import { Check, Sparkles, CreditCard, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormCheckbox from "@/components/auth/FormCheckbox";
import type { PlanInfo } from "./schemas";

// ─── Types ─────────────────────────────────────────────────────────────────────

/** Passed to onSubmit — contains the real Stripe payment method ID (pm_xxx) */
export interface PaymentData {
  paymentMethodId: string;
}

interface StepPlanConfirmationProps {
  selectedPlan: PlanInfo | null;
  plans: PlanInfo[];
  billingCycle: "monthly" | "annual";
  onBillingCycleChange: (cycle: "monthly" | "annual") => void;
  onPlanChange: (plan: PlanInfo) => void;
  onSubmit: (paymentData?: PaymentData) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

// ─── Inner paid card form (must live inside <Elements>) ────────────────────────

interface PaidCardFormProps {
  trialDays: number;
  priceDisplay: number; // per-month display price
  yearlyTotal?: number; // set when billing is annual
  billingCycle: "monthly" | "annual";
  termsAccepted: boolean;
  isSubmitting: boolean;
  onSubmit: (paymentData: PaymentData) => void;
}

function PaidCardForm({
  trialDays,
  priceDisplay,
  yearlyTotal,
  billingCycle,
  termsAccepted,
  isSubmitting,
  onSubmit,
}: PaidCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!stripe || !elements) return;
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setProcessing(true);
    setError("");

    try {
      const { paymentMethod, error: pmError } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
        });

      if (pmError) {
        setError(
          pmError.message ?? "Failed to process card. Please try again.",
        );
        return;
      }

      onSubmit({ paymentMethodId: paymentMethod.id });
    } catch (e: unknown) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to process card. Please try again.",
      );
    } finally {
      setProcessing(false);
    }
  }

  const busy = processing || isSubmitting;

  return (
    <div className="space-y-4">
      {/* Stripe Card Element */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Payment method
            </span>
          </div>
        </div>
        <StripeCardInput
          error={error}
          onChange={() => setError("")}
          disabled={busy}
        />
      </div>

      {/* Trial notice */}
      {trialDays > 0 && (
        <div className="pt-3 border-t border-border">
          <div className="flex items-start gap-3 text-sm">
            <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
              <Shield className="h-4 w-4 text-success" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                You won't be charged today
              </p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Your {trialDays}-day free trial starts now.{" "}
                {billingCycle === "annual" && yearlyTotal ? (
                  <>
                    After the trial: <strong>${priceDisplay}/mo</strong> billed
                    as <strong>${yearlyTotal.toFixed(2)}/yr</strong>. Cancel
                    anytime.
                  </>
                ) : (
                  <>
                    After the trial: <strong>${priceDisplay}/mo</strong>. Cancel
                    anytime.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Submit */}
      <Button
        type="button"
        className="w-full"
        onClick={handleSubmit}
        disabled={!termsAccepted || !stripe || busy}
      >
        {busy ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating…
          </>
        ) : trialDays > 0 ? (
          `Start ${trialDays}-day trial`
        ) : (
          "Create Account"
        )}
      </Button>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

const StepPlanConfirmation = ({
  selectedPlan,
  plans,
  billingCycle,
  onBillingCycleChange,
  onPlanChange,
  onSubmit,
  onBack,
  isSubmitting,
}: StepPlanConfirmationProps) => {
  const [termsAccepted, setTermsAccepted] = useState(false);

  const isPaidPlan = (selectedPlan?.priceMonthly ?? 0) > 0;
  const trialDays = selectedPlan?.trialDays ?? (isPaidPlan ? 14 : 0);
  const hasPaidPlans = plans.some((p) => p.priceMonthly > 0);

  // priceDisplay: per-month amount shown to user
  const priceDisplay =
    billingCycle === "monthly"
      ? (selectedPlan?.priceMonthly ?? 0)
      : (selectedPlan?.priceYearly ?? 0);

  // yearlyTotal: what they're actually charged per year when annual
  const yearlyTotal =
    billingCycle === "annual" && selectedPlan
      ? selectedPlan.priceYearly * 12
      : undefined;

  // Annual savings vs monthly
  const annualSavings =
    selectedPlan && selectedPlan.priceMonthly > 0
      ? (selectedPlan.priceMonthly - selectedPlan.priceYearly) * 12
      : 0;

  return (
    <div className="space-y-6">
      {/* Billing Toggle (if any paid plans exist) */}
      {hasPaidPlans && (
        <div className="flex justify-center mb-4">
          <div className="bg-muted/50 p-1.5 rounded-xl flex items-center inline-flex">
            <button
              type="button"
              onClick={() => onBillingCycleChange("monthly")}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
                billingCycle === "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => onBillingCycleChange("annual")}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                billingCycle === "annual"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Annual
              {annualSavings > 0 && (
                <span className="text-xs text-success font-medium">
                  Save ${annualSavings}/yr
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Selected Plan Summary */}
      {selectedPlan && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                {selectedPlan.name}
              </span>
              {isPaidPlan && trialDays > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded-full uppercase">
                  <Sparkles className="h-2.5 w-2.5" />
                  {trialDays}-day trial
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => {}}
              className="text-xs text-primary hover:underline"
            >
              Change plan
            </button>
          </div>

          {/* Price display */}
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-3xl font-bold text-foreground">
              ${priceDisplay}
            </span>
            <span className="text-muted-foreground text-sm">/month</span>
          </div>
          {billingCycle === "annual" && yearlyTotal && (
            <p className="text-xs text-muted-foreground mb-3">
              Billed as <strong>${yearlyTotal.toFixed(2)}/yr</strong> · Save $
              {annualSavings}/yr vs monthly
            </p>
          )}

          {/* Features preview */}
          <ul className="space-y-2 mt-3">
            {(selectedPlan.features ?? []).slice(0, 4).map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2 text-sm text-foreground"
              >
                <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Plan Grid */}
      <div className="space-y-3">
        <span className="text-sm font-medium text-foreground">
          Select a plan:
        </span>
        <div className="grid gap-2">
          {plans.map((plan) => {
            const isSelected = selectedPlan?.id === plan.id;
            const isPaid = plan.priceMonthly > 0;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => onPlanChange(plan)}
                disabled={isSubmitting}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors text-left ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div>
                  <span className="font-medium text-foreground">
                    {plan.name}
                  </span>
                  <span className="text-muted-foreground text-sm ml-2">
                    {isPaid ? `$${plan.priceMonthly}/mo` : "Free"}
                  </span>
                </div>
                {isSelected && <Check className="h-4 w-4 text-primary" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Terms checkbox */}
      <FormCheckbox
        checked={termsAccepted}
        onChange={(e) => setTermsAccepted(e.target.checked)}
        label={
          <span className="text-secondary text-sm">
            I agree to the{" "}
            <Link to="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </span>
        }
        containerClassName="flex items-start gap-2"
        labelClassName="text-secondary text-sm"
      />

      {/* Payment section — Stripe Elements for paid plans, plain button for free */}
      {isPaidPlan ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <Elements stripe={stripePromise}>
            <PaidCardForm
              trialDays={trialDays}
              priceDisplay={priceDisplay}
              yearlyTotal={yearlyTotal}
              billingCycle={billingCycle}
              termsAccepted={termsAccepted}
              isSubmitting={isSubmitting}
              onSubmit={(paymentData) => onSubmit(paymentData)}
            />
          </Elements>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
            <CreditCard className="h-4 w-4" />
            <span>No payment required for the free plan</span>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="primary-light"
              className="flex-1"
              onClick={onBack}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="default"
              className="flex-1"
              onClick={() => onSubmit()}
              disabled={!termsAccepted || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </div>
        </>
      )}

      {/* Back button for paid plans (outside card form) */}
      {isPaidPlan && (
        <Button
          type="button"
          variant="primary-light"
          className="w-full"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Back
        </Button>
      )}
    </div>
  );
};

export default StepPlanConfirmation;
