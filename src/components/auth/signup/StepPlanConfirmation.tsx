import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Check, Sparkles, CreditCard, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import FormCheckbox from "@/components/auth/FormCheckbox";
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
  const [showPlanSelector, setShowPlanSelector] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paymentValid, setPaymentValid] = useState(false);
  const paymentFormRef = useRef<PaymentMethodFormRef>(null);

  const price =
    billingCycle === "monthly"
      ? selectedPlan?.priceMonthly
      : selectedPlan?.priceYearly;

  const isPaidPlan = (selectedPlan?.priceMonthly ?? 0) > 0;
  const trialDays = selectedPlan?.trialDays ?? (isPaidPlan ? 14 : 0);

  const annualSavings =
    selectedPlan && selectedPlan.priceMonthly > 0
      ? (selectedPlan.priceMonthly - selectedPlan.priceYearly) * 12
      : 0;

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
    <div className="space-y-5">
      {/* Selected Plan Card */}
      <div className="relative">
        {isPaidPlan && trialDays > 0 && (
          <div className="absolute -top-3 left-4 bg-success text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            {trialDays}-day free trial
          </div>
        )}

        <div
          className={`rounded-xl border-2 p-5 ${
            isPaidPlan ? "border-primary bg-primary/5" : "border-border bg-card"
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg text-foreground">
                {selectedPlan?.name ?? "Free"} Plan
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {selectedPlan?.description}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPlanSelector(!showPlanSelector)}
              className="text-sm text-primary hover:underline font-medium"
            >
              Change
            </button>
          </div>

          {/* Billing Toggle for paid plans */}
          {isPaidPlan && (
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => onBillingCycleChange("monthly")}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  billingCycle === "monthly"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => onBillingCycleChange("annual")}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  billingCycle === "annual"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                Annual
                {annualSavings > 0 && (
                  <span className="ml-1 text-xs opacity-80">
                    (Save ${annualSavings})
                  </span>
                )}
              </button>
            </div>
          )}

          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-3xl font-bold text-foreground">
              ${price ?? 0}
            </span>
            <span className="text-muted-foreground text-sm">/month</span>
            {isPaidPlan && trialDays > 0 && (
              <span className="ml-2 text-sm text-success font-medium">
                Free for {trialDays} days
              </span>
            )}
          </div>

          {/* Features preview */}
          <ul className="space-y-2">
            {(selectedPlan?.features ?? []).slice(0, 4).map((feature) => (
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
      </div>

      {/* Plan Selector (collapsed by default) */}
      {showPlanSelector && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Select a plan:</p>
          <div className="grid gap-2">
            {plans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => {
                  onPlanChange(plan);
                  setShowPlanSelector(false);
                }}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors text-left ${
                  selectedPlan?.id === plan.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div>
                  <span className="font-medium text-foreground">
                    {plan.name}
                  </span>
                  <span className="text-muted-foreground text-sm ml-2">
                    ${plan.priceMonthly}/mo
                  </span>
                </div>
                {selectedPlan?.id === plan.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

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
