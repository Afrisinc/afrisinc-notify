import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Check, Sparkles, CreditCard, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormCheckbox from "@/components/auth/FormCheckbox";
import { PlanCards } from "@/components/pricing/PlanCards";
import PaymentMethodForm, {
  type PaymentMethodFormRef,
  type PaymentData,
} from "./PaymentMethodForm";
import type { PlanInfo } from "./schemas";

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
  const [paymentValid, setPaymentValid] = useState(false);
  const paymentFormRef = useRef<PaymentMethodFormRef>(null);

  const price =
    billingCycle === "monthly"
      ? selectedPlan?.priceMonthly
      : selectedPlan?.priceYearly;

  const isPaidPlan = (selectedPlan?.priceMonthly ?? 0) > 0;
  const trialDays = selectedPlan?.trialDays ?? (isPaidPlan ? 14 : 0);

  const hasPaidPlans = plans.some((p) => p.priceMonthly > 0);

  const handleSubmit = () => {
    if (isPaidPlan) {
      const paymentData = paymentFormRef.current?.getPaymentData();
      if (!paymentData) {
        return;
      }
      onSubmit(paymentData);
    } else {
      onSubmit();
    }
  };

  const canSubmit =
    termsAccepted && (!isPaidPlan || paymentValid) && !isSubmitting;

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
          <PaymentMethodForm
            ref={paymentFormRef}
            onValidChange={setPaymentValid}
            disabled={isSubmitting}
          />

          {/* Trial notice */}
          {trialDays > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-start gap-3 text-sm">
                <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                  <Shield className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    You won't be charged today
                  </p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Your {trialDays}-day free trial starts now. You'll be
                    charged ${price}/month after the trial ends. Cancel anytime.
                  </p>
                </div>
              </div>
            </div>
          )}
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

      {/* Action Buttons */}
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
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : isPaidPlan && trialDays > 0 ? (
            `Start ${trialDays}-day trial`
          ) : (
            "Create Account"
          )}
        </Button>
      </div>
    </div>
  );
};

export default StepPlanConfirmation;
