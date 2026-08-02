import { useState, useMemo, useEffect } from "react";
import { Building2, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { CardPaymentStep } from "@/components/payment/CardPaymentStep";
import { MobilePaymentStep } from "@/components/payment/MobilePaymentStep";
import { PaymentMethodSelector } from "@/components/payment/PaymentMethodSelector";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicPlans } from "@/hooks/useSubscription";
import { computePlanPrice } from "@/lib/pricing";
import type { PlanInfo } from "@/components/auth/signup/schemas";
import { PlanCards } from "@/components/pricing/PlanCards";
import { useMobilePaymentConfirmation } from "@/hooks/usePayg";
import { useCardPayment, useMobilePayment } from "@/hooks/usePayment";
import { useExchangeRate } from "@/lib/exchangeRate";

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

type PaymentMethod = "card" | "mobile";

interface CreateOrganizationFormProps {
  accountId: string;
  email: string;
  name?: string;
  onSubmit: (data: {
    name: string;
    planId: string;
    billingCycle: "monthly" | "annual";
    paymentMethodId?: string;
    customerId?: string;
  }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

// ── Pending Step (Mobile Payment Confirmation) ───────────────────────────────

interface PendingStepProps {
  accountId: string;
  paymentRef: string;
  orgName: string;
  selectedPlan: PlanInfo;
  onSuccess: () => void;
  onFailed: () => void;
}

function PendingStep({
  accountId,
  paymentRef,
  orgName,
  selectedPlan,
  onSuccess,
  onFailed,
}: PendingStepProps) {
  const { confirmed, failed, timedOut } = useMobilePaymentConfirmation(
    accountId,
    paymentRef,
    null,
  );

  useEffect(() => {
    if (confirmed) onSuccess();
    if (failed) onFailed();
  }, [confirmed, failed, onSuccess, onFailed]);

  return (
    <div className="space-y-5 text-center py-6">
      <div className="flex justify-center">
        {confirmed ? (
          <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle className="h-7 w-7 text-success" />
          </div>
        ) : failed ? (
          <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
        ) : timedOut ? (
          <div className="h-14 w-14 rounded-full bg-warning/10 flex items-center justify-center">
            <AlertCircle className="h-7 w-7 text-warning" />
          </div>
        ) : (
          <div className="h-14 w-14 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <Loader2 className="h-7 w-7 text-yellow-600 animate-spin" />
          </div>
        )}
      </div>

      <div>
        {confirmed ? (
          <>
            <p className="font-semibold text-lg text-foreground">
              Payment Successful!
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Creating your organization...
            </p>
          </>
        ) : failed ? (
          <>
            <p className="font-semibold text-lg text-destructive">
              Payment Failed
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              The payment was not completed. Please try again.
            </p>
          </>
        ) : timedOut ? (
          <>
            <p className="font-semibold text-lg text-warning">
              Payment Taking Too Long
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              We haven't received confirmation yet. Please check your phone for
              a pending prompt, or ensure you have sufficient balance and try
              again.
            </p>
          </>
        ) : (
          <>
            <p className="font-semibold text-lg text-foreground">
              Check your phone
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              A payment prompt has been sent to your phone. Please enter your
              PIN to confirm the payment.
            </p>
            <div className="mt-3 flex justify-center">
              <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full animate-pulse w-full" />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        <p className="font-medium">{orgName}</p>
        <p>{selectedPlan.name} Plan</p>
      </div>

      {(failed || timedOut) && (
        <Button variant="outline" onClick={onFailed} className="w-full">
          Try Again
        </Button>
      )}
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────

const CreateOrganizationForm = ({
  accountId,
  email,
  name,
  onSubmit,
  onCancel,
  isSubmitting,
}: CreateOrganizationFormProps) => {
  const [step, setStep] = useState<
    "plan" | "method" | "card" | "mobile" | "pending"
  >("plan");
  const [orgName, setOrgName] = useState("");
  const [orgNameError, setOrgNameError] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<PlanInfo | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly",
  );
  const [mobilePaymentRef, setMobilePaymentRef] = useState<string | null>(null);

  const { data: plansData, isLoading: plansLoading } = usePublicPlans();
  const { data: exchangeRate } = useExchangeRate();
  const { initCardPayment } = useCardPayment(accountId);
  const { initMobilePayment } = useMobilePayment(accountId);

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
    setStep("method");
  };

  const handleFreeSubmit = () => {
    if (!orgName.trim() || !selectedPlan) return;
    onSubmit({ name: orgName.trim(), planId: selectedPlan.id, billingCycle });
  };

  const handleCardPaymentSuccess = () => {
    // Card payment initiated - retrieve pcode from localStorage for proof of payment
    const pcode = localStorage.getItem(
      `subscription_payment_pcode_${accountId}`,
    );
    onSubmit({
      name: orgName.trim(),
      planId: selectedPlan!.id,
      billingCycle,
      paymentMethodId: pcode || undefined,
    });
  };

  const handleMobileSuccess = (paymentRef: string) => {
    setMobilePaymentRef(paymentRef);
    setStep("pending");
  };

  const handleMobilePaymentConfirmed = () => {
    // Mobile payment confirmed - submit the form
    onSubmit({
      name: orgName.trim(),
      planId: selectedPlan!.id,
      billingCycle,
    });
  };

  const handleMobilePaymentFailed = () => {
    // Go back to mobile step to retry
    setMobilePaymentRef(null);
    setStep("mobile");
  };

  const canProceedStep1 = orgName.trim() && selectedPlan;

  return (
    <div className="space-y-5">
      {/* ── Step 1: name + plan ──────────────────────────────────────────────── */}
      {step === "plan" && (
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
              <PlanCards
                plans={plans}
                selectedPlan={selectedPlan}
                onPlanChange={setSelectedPlan}
                billingCycle={billingCycle}
              />
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

      {/* ── Step 2: Payment Method Selection ─────────────────────────────────── */}
      {step === "method" && isPaidPlan && selectedPlan && (
        <PaymentMethodSelector
          chargeAmount={
            computePlanPrice(
              {
                monthlyPrice: selectedPlan.priceMonthly,
                yearlyPrice: selectedPlan.priceYearly,
              },
              billingCycle === "annual" ? "yearly" : "monthly",
            ).billed
          }
          onSelectCard={() => setStep("card")}
          onSelectMobile={() => setStep("mobile")}
          onBack={() => setStep("plan")}
          summaryItems={[
            { label: "Organization", value: orgName },
            {
              label: `${selectedPlan.name} Plan`,
              value: computePlanPrice(
                {
                  monthlyPrice: selectedPlan.priceMonthly,
                  yearlyPrice: selectedPlan.priceYearly,
                },
                billingCycle === "annual" ? "yearly" : "monthly",
              ).display,
              highlight: true,
              color: "primary" as const,
            },
          ]}
        />
      )}

      {/* ── Step 3a: Card Payment ─────────────────────────────────────────────── */}
      {step === "card" && isPaidPlan && selectedPlan && (
        <CardPaymentStep
          chargeAmount={
            computePlanPrice(
              {
                monthlyPrice: selectedPlan.priceMonthly,
                yearlyPrice: selectedPlan.priceYearly,
              },
              billingCycle === "annual" ? "yearly" : "monthly",
            ).billed
          }
          accountId={accountId}
          customerEmail={email}
          onInitPayment={(customerEmail) =>
            initCardPayment({
              type: "subscription",
              planId: selectedPlan.id,
              billingCycle: billingCycle === "annual" ? "yearly" : "monthly",
              email: customerEmail,
            })
          }
          onSuccess={handleCardPaymentSuccess}
          onBack={() => setStep("method")}
          storageKeyPrefix="subscription_payment_pcode"
          summaryItems={[
            { label: "Organization", value: orgName },
            {
              label: `${selectedPlan.name} Plan`,
              value: computePlanPrice(
                {
                  monthlyPrice: selectedPlan.priceMonthly,
                  yearlyPrice: selectedPlan.priceYearly,
                },
                billingCycle === "annual" ? "yearly" : "monthly",
              ).display,
              highlight: true,
              color: "primary" as const,
            },
            ...(trialDays > 0
              ? [
                  {
                    label: "Trial period",
                    value: `${trialDays} days free`,
                    color: "success" as const,
                  },
                ]
              : []),
          ]}
          infoTitle="You'll be redirected to PesaPal"
          infoDescription={`Complete your card payment securely. Your ${trialDays}-day free trial will start after payment is confirmed.`}
        />
      )}

      {/* ── Step 3b: Mobile Money ─────────────────────────────────────────────── */}
      {step === "mobile" && isPaidPlan && selectedPlan && (
        <MobilePaymentStep
          chargeAmount={
            computePlanPrice(
              {
                monthlyPrice: selectedPlan.priceMonthly,
                yearlyPrice: selectedPlan.priceYearly,
              },
              billingCycle === "annual" ? "yearly" : "monthly",
            ).billed
          }
          accountId={accountId}
          customerName={orgName}
          exchangeRate={exchangeRate}
          onInitPayment={(phone, name) =>
            initMobilePayment({
              type: "subscription",
              planId: selectedPlan.id,
              billingCycle: billingCycle === "annual" ? "yearly" : "monthly",
              phoneNumber: phone,
              customerName: name,
            })
          }
          onSuccess={handleMobileSuccess}
          onBack={() => setStep("method")}
          summaryItems={[
            { label: "Organization", value: orgName },
            {
              label: `${selectedPlan.name} Plan`,
              value: computePlanPrice(
                {
                  monthlyPrice: selectedPlan.priceMonthly,
                  yearlyPrice: selectedPlan.priceYearly,
                },
                billingCycle === "annual" ? "yearly" : "monthly",
              ).display,
              highlight: true,
              color: "primary" as const,
            },
            ...(trialDays > 0
              ? [
                  {
                    label: "Trial period",
                    value: `${trialDays} days free`,
                    color: "success" as const,
                  },
                ]
              : []),
          ]}
        />
      )}

      {/* ── Step 4: Pending (Mobile Payment Confirmation) ─────────────────────── */}
      {step === "pending" && selectedPlan && mobilePaymentRef && (
        <PendingStep
          accountId={accountId}
          paymentRef={mobilePaymentRef}
          orgName={orgName}
          selectedPlan={selectedPlan}
          onSuccess={handleMobilePaymentConfirmed}
          onFailed={handleMobilePaymentFailed}
        />
      )}
    </div>
  );
};

export default CreateOrganizationForm;
