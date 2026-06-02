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
import { CreditCard, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormCheckbox from "@/components/auth/FormCheckbox";
import { PlanCards } from "@/components/pricing/PlanCards";
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
  price: number;
  termsAccepted: boolean;
  isSubmitting: boolean;
  onSubmit: (paymentData: PaymentData) => void;
}

function PaidCardForm({
  trialDays,
  price,
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
                Your {trialDays}-day free trial starts now. You'll be charged $
                {price}/month after the trial ends. Cancel anytime.
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

  // Price based on billing cycle
  const price =
    billingCycle === "monthly"
      ? (selectedPlan?.priceMonthly ?? 0)
      : (selectedPlan?.priceYearly ?? 0);

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
            </button>
          </div>
        </div>
      )}

      {/* Plan Cards Grid */}
      <PlanCards
        plans={plans}
        selectedPlan={selectedPlan}
        onPlanChange={onPlanChange}
        billingCycle={billingCycle}
      />

      {/* Payment Method Form for paid plans */}
      {isPaidPlan && (
        <div className="rounded-xl border border-border bg-card p-5">
          <Elements stripe={stripePromise}>
            <PaidCardForm
              trialDays={trialDays}
              price={price}
              termsAccepted={termsAccepted}
              isSubmitting={isSubmitting}
              onSubmit={(paymentData) => onSubmit(paymentData)}
            />
          </Elements>
        </div>
      )}

      {/* Free plan message */}
      {!isPaidPlan && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
          <CreditCard className="h-4 w-4" />
          <span>No payment required for the free plan</span>
        </div>
      )}

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

      {/* Actions for free plan */}
      {!isPaidPlan && (
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
