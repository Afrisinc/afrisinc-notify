import { useState, useMemo } from "react";
import {
  Check,
  Sparkles,
  Building2,
  Loader2,
  Shield,
  Lock,
} from "lucide-react";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { StripeCardInput } from "@/components/payment/StripeCardInput";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicPlans } from "@/hooks/useSubscription";
import { computePlanPrice } from "@/lib/pricing";
import type { PlanInfo } from "@/components/auth/signup/schemas";

// ── Constants ──────────────────────────────────────────────────────────────────

const planDescriptions: Record<string, string> = {
  FREE: "Email only — test before you commit.",
  STARTER: "All channels unlocked — best entry point.",
  SCALE: "For fast-growing businesses.",
  ENTERPRISE: "Large operations — negotiated volume.",
  PAYG: "Pay only for what you use.",
};

const formatLimitValue = (limit: number | string): string => {
  if (limit === "Unlimited" || limit === -1) return "Unlimited";
  if (typeof limit === "number") return limit.toLocaleString();
  return String(limit);
};

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

const generatePlanFeatures = (
  limits: Array<{ metric: string; limit: number | string; period: string }>,
): string[] => {
  const keyMetrics = [
    "emails_per_month",
    "sms_per_month",
    "push_subscribers",
    "in_app_per_month",
  ];
  return keyMetrics
    .map((metric) => {
      const l = limits.find((x) => x.metric === metric);
      if (!l) return null;
      const value = formatLimitValue(l.limit);
      const label = getMetricLabel(metric);
      if (value === "Unlimited")
        return `Unlimited ${label.split(" / mo").join("")}`;
      if (typeof l.limit === "number" && l.limit > 0)
        return `${value} ${label}`;
      return null;
    })
    .filter(Boolean)
    .slice(0, 4) as string[];
};

// ── Types ──────────────────────────────────────────────────────────────────────

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

// ── Inner paid-card step (must be inside <Elements>) ──────────────────────────

interface PaidCardStepProps {
  orgName: string;
  selectedPlan: PlanInfo;
  billingCycle: "monthly" | "annual";
  trialDays: number;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: (paymentMethodId: string) => void;
}

function PaidCardStep({
  orgName,
  selectedPlan,
  billingCycle,
  trialDays,
  isSubmitting,
  onBack,
  onSubmit,
}: PaidCardStepProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Compute correct price for summary
  const priceInfo = computePlanPrice(
    {
      monthlyPrice: selectedPlan.priceMonthly,
      yearlyPrice: selectedPlan.priceYearly,
    },
    billingCycle === "annual" ? "yearly" : "monthly",
  );

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    const card = elements.getElement(CardElement);
    if (!card) return;

    setBusy(true);
    setCardError(null);

    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: "card",
      card,
    });

    if (error) {
      setCardError(error.message ?? "Card error");
      setBusy(false);
      return;
    }

    onSubmit(paymentMethod!.id);
  };

  const loading = busy || isSubmitting;

  return (
    <>
      {/* Summary card */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Organization</p>
            <p className="font-semibold text-foreground">{orgName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              {selectedPlan.name} Plan
            </p>
            <p className="font-semibold text-foreground">
              {priceInfo.display}
              <span className="text-sm font-normal text-muted-foreground">
                {priceInfo.periodLabel}
              </span>
              {trialDays > 0 && (
                <span className="ml-1 text-sm font-normal text-success">
                  (Free for {trialDays} days)
                </span>
              )}
            </p>
            {priceInfo.note && priceInfo.cycle === "yearly" && (
              <p className="text-[11px] text-success">{priceInfo.note}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stripe card input */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              Payment method
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Secure · Powered by Stripe</span>
          </div>
        </div>

        <StripeCardInput
          error={cardError}
          onChange={() => setCardError(null)}
          disabled={loading}
        />

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
                  Your {trialDays}-day free trial starts now. You'll be charged{" "}
                  {priceInfo.display}
                  {priceInfo.periodLabel} after the trial ends. Cancel anytime.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onBack}
          disabled={loading}
        >
          Back
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={handleSubmit}
          disabled={!stripe || loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : trialDays > 0 ? (
            `Start ${trialDays}-day trial`
          ) : (
            "Create Organization"
          )}
        </Button>
      </div>
    </>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────

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

  const { data: plansData, isLoading: plansLoading } = usePublicPlans();

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
        features: generatePlanFeatures(plan.limits),
        trialDays: plan.priceMonthly > 0 ? 14 : 0,
      }));
  }, [plansData]);

  const isPaidPlan = (selectedPlan?.priceMonthly ?? 0) > 0;
  const trialDays = selectedPlan?.trialDays ?? (isPaidPlan ? 14 : 0);

  const handleNext = () => {
    if (!orgName.trim()) {
      setOrgNameError("Organization name is required");
      return;
    }
    if (!selectedPlan) return;
    setOrgNameError("");
    setStep(2);
  };

  const handleFreeSubmit = () => {
    if (!orgName.trim() || !selectedPlan) return;
    onSubmit({ name: orgName.trim(), planId: selectedPlan.id, billingCycle });
  };

  const handlePaidSubmit = (paymentMethodId: string) => {
    onSubmit({
      name: orgName.trim(),
      planId: selectedPlan!.id,
      billingCycle,
      paymentMethodId,
    });
  };

  const canProceedStep1 = orgName.trim() && selectedPlan;

  return (
    <div className="space-y-5">
      {/* ── Step 1: name + plan ──────────────────────────────────────────────── */}
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

            {plansLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-64 rounded-xl" />
                ))}
              </div>
            )}

            {!plansLoading && (
              <div className="grid gap-2">
                {plans.map((plan) => {
                  const isSelected = selectedPlan?.id === plan.id;
                  const isPaid = plan.priceMonthly > 0;
                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan)}
                      disabled={isSubmitting}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40 bg-card"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {plan.name}
                          </span>
                          {isPaid && plan.trialDays && plan.trialDays > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded-full uppercase">
                              <Sparkles className="h-2.5 w-2.5" />
                              {plan.trialDays}-day trial
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {plan.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          {isPaid ? (
                            <>
                              <span className="text-lg font-bold text-foreground">
                                ${plan.priceMonthly}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                /mo
                              </span>
                              {plan.priceYearly > 0 &&
                                plan.priceYearly < plan.priceMonthly && (
                                  <p className="text-[11px] text-success">
                                    or ${plan.priceYearly}/mo billed annually
                                  </p>
                                )}
                            </>
                          ) : (
                            <span className="text-lg font-bold text-foreground">
                              Free
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Billing Cycle Toggle */}
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
                      /yr)
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
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
                onClick={handleFreeSubmit}
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

      {/* ── Step 2: payment (paid plans only) ───────────────────────────────── */}
      {step === 2 && isPaidPlan && selectedPlan && (
        <Elements stripe={stripePromise}>
          <PaidCardStep
            orgName={orgName}
            selectedPlan={selectedPlan}
            billingCycle={billingCycle}
            trialDays={trialDays}
            isSubmitting={isSubmitting}
            onBack={() => setStep(1)}
            onSubmit={handlePaidSubmit}
          />
        </Elements>
      )}
    </div>
  );
};

export default CreateOrganizationForm;
