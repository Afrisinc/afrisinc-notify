import { useEffect, useState } from "react";
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
import { subscriptionService } from "@/services/subscriptionService";
import type { PlanInfo } from "./schemas";

export interface PaymentData {
  paymentMethodId: string;
  customerId: string;
}

interface StepPlanConfirmationProps {
  email: string;
  name?: string;
  selectedPlan: PlanInfo | null;
  plans: PlanInfo[];
  billingCycle: "monthly" | "annual";
  onBillingCycleChange: (cycle: "monthly" | "annual") => void;
  onPlanChange: (plan: PlanInfo) => void;
  onSubmit: (paymentData?: PaymentData) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

interface PaidCardFormProps {
  email: string;
  name?: string;
  billingCycle: "monthly" | "annual";
  trialDays: number;
  price: number;
  termsAccepted: boolean;
  isSubmitting: boolean;
  onSubmit: (paymentData: PaymentData) => void;
}

function PaidCardForm({
  email,
  name,
  billingCycle,
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
  const [setupIntentState, setSetupIntentState] = useState<{
    clientSecret: string;
    customerId: string;
  } | null>(null);
  const [setupIntentLoading, setSetupIntentLoading] = useState(true);
  const [setupIntentError, setSetupIntentError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setSetupIntentLoading(true);
    setSetupIntentError("");
    subscriptionService
      .createAnonymousSetupIntent(email, name)
      .then((result) => {
        if (!cancelled)
          setSetupIntentState({
            clientSecret: result.clientSecret,
            customerId: result.customerId,
          });
      })
      .catch((err) => {
        if (!cancelled)
          setSetupIntentError(
            err?.response?.data?.message ??
              err?.message ??
              "Failed to initialise payment. Please try again.",
          );
      })
      .finally(() => {
        if (!cancelled) setSetupIntentLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [email, name]);

  async function handleSubmit() {
    if (!stripe || !elements || !setupIntentState) return;
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;
    setProcessing(true);
    setError("");
    try {
      const { setupIntent, error: setupError } = await stripe.confirmCardSetup(
        setupIntentState.clientSecret,
        { payment_method: { card: cardElement } },
      );
      if (setupError) {
        setError(
          setupError.message ?? "Failed to save card. Please try again.",
        );
        return;
      }
      const paymentMethodId =
        typeof setupIntent.payment_method === "string"
          ? setupIntent.payment_method
          : (setupIntent.payment_method?.id ?? "");
      if (!paymentMethodId) {
        setError("Card setup completed but no payment method was returned.");
        return;
      }
      onSubmit({ paymentMethodId, customerId: setupIntentState.customerId });
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

  if (setupIntentLoading) {
    return (
      <div className="flex items-center justify-center py-6 text-sm text-muted-foreground gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Initialising secure payment…
      </div>
    );
  }
  if (setupIntentError) {
    return (
      <p className="text-sm text-destructive py-4 text-center">
        {setupIntentError}
      </p>
    );
  }

  return (
    <div className="space-y-4">
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
                {price}/{billingCycle === "annual" ? "yr" : "mo"} after the
                trial ends. Cancel anytime.
              </p>
            </div>
          </div>
        </div>
      )}

      <Button
        type="button"
        className="w-full"
        onClick={handleSubmit}
        disabled={!termsAccepted || !stripe || busy || !setupIntentState}
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

const StepPlanConfirmation = ({
  email,
  name,
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
  const price =
    billingCycle === "monthly"
      ? (selectedPlan?.priceMonthly ?? 0)
      : (selectedPlan?.priceYearly ?? 0);

  return (
    <div className="space-y-6">
      {hasPaidPlans && (
        <div className="flex justify-center mb-4">
          <div className="bg-muted/50 p-1.5 rounded-xl flex items-center inline-flex">
            <button
              type="button"
              onClick={() => onBillingCycleChange("monthly")}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors ${billingCycle === "monthly" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => onBillingCycleChange("annual")}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${billingCycle === "annual" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              Annual
            </button>
          </div>
        </div>
      )}

      <PlanCards
        plans={plans}
        selectedPlan={selectedPlan}
        onPlanChange={onPlanChange}
        billingCycle={billingCycle}
      />

      {isPaidPlan && selectedPlan && (
        <div className="rounded-xl border border-border bg-card p-5">
          <Elements stripe={stripePromise}>
            <PaidCardForm
              email={email}
              name={name}
              billingCycle={billingCycle}
              trialDays={trialDays}
              price={price}
              termsAccepted={termsAccepted}
              isSubmitting={isSubmitting}
              onSubmit={(paymentData) => onSubmit(paymentData)}
            />
          </Elements>
        </div>
      )}

      {!isPaidPlan && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
          <CreditCard className="h-4 w-4" />
          <span>No payment required for the free plan</span>
        </div>
      )}

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
