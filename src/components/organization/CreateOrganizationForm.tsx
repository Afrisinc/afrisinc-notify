import { useState, useRef, useMemo } from "react";
import { Check, Sparkles, Building2, Loader2, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PaymentMethodForm, {
  type PaymentMethodFormRef,
} from "@/components/auth/signup/PaymentMethodForm";
import { usePublicPlans } from "@/hooks/useSubscription";
import type { PlanInfo } from "@/components/auth/signup/schemas";
import { PlanCards } from "@/components/pricing/PlanCards";

// Plan descriptions mapping
const planDescriptions: Record<string, string> = {
  FREE: "Email only — test before you commit.",
  STARTER: "All channels unlocked — best entry point.",
  SCALE: "For fast-growing businesses.",
  ENTERPRISE: "Large operations — negotiated volume.",
  PAYG: "Pay only for what you use.",
};

// Helper to format limit value for display
const formatLimitValue = (limit: number | string): string => {
  if (limit === "Unlimited" || limit === -1) return "Unlimited";
  if (typeof limit === "number") {
    return limit.toLocaleString();
  }
  return String(limit);
};

// Helper to get human-readable metric name
const getMetricLabel = (metric: string): string => {
  const labels: Record<string, string> = {
    emails_per_month: "emails / mo",
    sms_per_month: "SMS / mo",
    push_subscribers: "push subscribers",
    in_app_per_month: "in-app / mo",
    apps: "apps",
    contacts: "contacts",
  };
  return labels[metric] || metric.split("_").join(" ");
};

// Generate features from plan limits
const generatePlanFeatures = (
  limits: Array<{ metric: string; limit: number | string; period: string }>,
  planName: string,
): string[] => {
  const features: string[] = [];
  const keyMetrics = [
    "emails_per_month",
    "sms_per_month",
    "push_subscribers",
    "in_app_per_month",
  ];

  for (const metric of keyMetrics) {
    const limit = limits.find((l) => l.metric === metric);
    if (limit) {
      const value = formatLimitValue(limit.limit);
      const label = getMetricLabel(metric);
      if (value === "Unlimited") {
        features.push(`Unlimited ${label.split(" / mo").join("")}`);
      } else if (typeof limit.limit === "number" && limit.limit > 0) {
        features.push(`${value} ${label}`);
      }
    }
  }

  // Add support level based on plan
  if (planName === "FREE") {
    features.push("Community support");
  } else if (planName === "STARTER") {
    features.push("Email support (48h)");
  } else if (planName === "SCALE") {
    features.push("Priority support (12h SLA)");
  } else if (planName === "ENTERPRISE") {
    features.push("Dedicated account manager");
  } else if (planName === "PAYG") {
    features.push("No subscription required");
    features.push("Credits never expire");
  }

  return features.slice(0, 4);
};

interface CreateOrganizationFormProps {
  onSubmit: (data: {
    name: string;
    planId: string;
    billingCycle: "monthly" | "annual";
    paymentMethodId?: string;
  }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const CreateOrganizationForm = ({
  onSubmit,
  onCancel,
  isSubmitting,
}: CreateOrganizationFormProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [orgName, setOrgName] = useState("");
  const [orgNameError, setOrgNameError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<PlanInfo | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly",
  );
  const [paymentValid, setPaymentValid] = useState(false);
  const paymentFormRef = useRef<PaymentMethodFormRef>(null);

  const { data: plansData, isLoading: plansLoading } = usePublicPlans();

  // Transform plans data to PlanInfo format
  const plans: PlanInfo[] = useMemo(() => {
    if (!plansData) return [];
    return plansData
      .filter((p) => p.name !== "PRO")
      .map((plan) => ({
        id: plan.id,
        name: plan.name.charAt(0) + plan.name.slice(1).toLowerCase(),
        priceMonthly: plan.priceMonthly,
        priceYearly: plan.priceYearly,
        description: planDescriptions[plan.name] || "",
        features: generatePlanFeatures(plan.limits, plan.name),
        trialDays: plan.priceMonthly > 0 ? 14 : 0,
      }));
  }, [plansData]);

  const isPaidPlan = (selectedPlan?.priceMonthly ?? 0) > 0;
  const trialDays = selectedPlan?.trialDays ?? (isPaidPlan ? 14 : 0);
  const price =
    billingCycle === "monthly"
      ? selectedPlan?.priceMonthly
      : selectedPlan?.priceYearly;

  const handleNext = () => {
    if (!orgName.trim()) {
      setOrgNameError("Organization name is required");
      return;
    }
    if (!selectedPlan) {
      return;
    }
    setOrgNameError("");
    setStep(2);
  };

  const handleSubmit = () => {
    if (isPaidPlan) {
      const paymentData = paymentFormRef.current?.getPaymentData();
      if (!paymentData) {
        return;
      }
      // Generate payment method ID (in production, this comes from Stripe)
      const paymentMethodId = `pm_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      onSubmit({
        name: orgName.trim(),
        planId: selectedPlan!.id,
        billingCycle,
        paymentMethodId,
      });
    } else {
      onSubmit({
        name: orgName.trim(),
        planId: selectedPlan!.id,
        billingCycle,
      });
    }
  };

  const canProceedStep1 = orgName.trim() && selectedPlan;
  const canSubmit = !isPaidPlan || paymentValid;

  return (
    <div className="space-y-5">
      {step === 1 && (
        <>
          {/* Organization Name */}
          <div className="space-y-2">
            <label htmlFor="org-name" className="form-label">
              Organization name
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="org-name"
                placeholder="e.g., Acme Inc."
                value={orgName}
                onChange={(e) => {
                  setOrgName(e.target.value);
                  if (orgNameError) setOrgNameError("");
                }}
                className="pl-10"
                disabled={isSubmitting}
              />
            </div>
            {orgNameError && <p className="form-error">{orgNameError}</p>}
          </div>

          {/* Plan Selection */}
          <div className="space-y-3">
            <span className="form-label">Select a plan</span>

            {/* Loading skeleton */}
            {plansLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-64 rounded-xl" />
                ))}
              </div>
            )}

            {!plansLoading && (
              <PlanCards
                plans={plans}
                selectedPlan={selectedPlan}
                onPlanChange={setSelectedPlan}
                billingCycle={billingCycle}
              />
            )}
          </div>

          {/* Billing Cycle Toggle (for paid plans) */}
          {selectedPlan && isPaidPlan && (
            <div className="space-y-2">
              <span className="form-label">Billing cycle</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    billingCycle === "monthly"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("annual")}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    billingCycle === "annual"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Annual
                  {selectedPlan.priceMonthly > selectedPlan.priceYearly && (
                    <span className="ml-1 text-xs opacity-80">
                      (Save $
                      {(selectedPlan.priceMonthly - selectedPlan.priceYearly) *
                        12}
                      )
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            {isPaidPlan ? (
              <Button
                type="button"
                className="flex-1"
                onClick={handleNext}
                disabled={!canProceedStep1 || isSubmitting}
              >
                Continue to Payment
              </Button>
            ) : (
              <Button
                type="button"
                className="flex-1"
                onClick={handleSubmit}
                disabled={!canProceedStep1 || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Organization"
                )}
              </Button>
            )}
          </div>
        </>
      )}

      {step === 2 && isPaidPlan && (
        <>
          {/* Summary */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Organization</p>
                <p className="font-semibold text-foreground">{orgName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {selectedPlan?.name} Plan
                </p>
                <p className="font-semibold text-foreground">
                  ${price}/mo
                  {trialDays > 0 && (
                    <span className="ml-1 text-sm font-normal text-success">
                      (Free for {trialDays} days)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
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
                      charged ${price}/month after the trial ends. Cancel
                      anytime.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setStep(1)}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting && (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              )}
              {!isSubmitting && trialDays > 0 && `Start ${trialDays}-day trial`}
              {!isSubmitting && trialDays === 0 && "Create Organization"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default CreateOrganizationForm;
