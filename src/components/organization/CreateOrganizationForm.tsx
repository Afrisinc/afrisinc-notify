import { useState, useMemo, useEffect } from "react";
import {
  Building2,
  Loader2,
  Shield,
  Lock,
  CreditCard,
  Smartphone,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicPlans } from "@/hooks/useSubscription";
import { subscriptionService } from "@/services/subscriptionService";
import { computePlanPrice } from "@/lib/pricing";
import type { PlanInfo } from "@/components/auth/signup/schemas";
import { PlanCards } from "@/components/pricing/PlanCards";
import {
  useInitMobileTopUp,
  useMobilePaymentConfirmation,
} from "@/hooks/usePayg";
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

// ── Inner paid-card step (must be inside <Elements>) ──────────────────────────

interface PaidCardStepProps {
  accountId: string;
  email: string;
  name?: string;
  orgName: string;
  selectedPlan: PlanInfo;
  billingCycle: "monthly" | "annual";
  trialDays: number;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: (paymentMethodId: string, customerId: string) => void;
}

function PaidCardStep({
  accountId,
  email,
  name,
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
  const [setupIntentState, setSetupIntentState] = useState<{
    clientSecret: string;
    customerId: string;
  } | null>(null);
  const [setupIntentLoading, setSetupIntentLoading] = useState(true);
  const [setupIntentError, setSetupIntentError] = useState("");

  // Create SetupIntent on mount — accountId is known here (authenticated org creation)
  useEffect(() => {
    let cancelled = false;
    setSetupIntentLoading(true);
    setSetupIntentError("");
    subscriptionService
      .createSetupIntent(accountId, email, name)
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
  }, [accountId, email, name]);

  // Compute correct price for summary
  const priceInfo = computePlanPrice(
    {
      monthlyPrice: selectedPlan.priceMonthly,
      yearlyPrice: selectedPlan.priceYearly,
    },
    billingCycle === "annual" ? "yearly" : "monthly",
  );

  const handleSubmit = async () => {
    if (!stripe || !elements || !setupIntentState) return;
    const card = elements.getElement(CardElement);
    if (!card) return;

    setBusy(true);
    setCardError(null);

    const { setupIntent, error } = await stripe.confirmCardSetup(
      setupIntentState.clientSecret,
      { payment_method: { card } },
    );

    if (error) {
      setCardError(error.message ?? "Card error");
      setBusy(false);
      return;
    }

    const paymentMethodId =
      typeof setupIntent.payment_method === "string"
        ? setupIntent.payment_method
        : (setupIntent.payment_method?.id ?? "");

    if (!paymentMethodId) {
      setCardError("Card setup completed but no payment method was returned.");
      setBusy(false);
      return;
    }

    onSubmit(paymentMethodId, setupIntentState.customerId);
  };

  const loading = busy || isSubmitting;

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
          disabled={!stripe || loading || !setupIntentState}
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

// ── Mobile Money Step ─────────────────────────────────────────────────────────

interface MobileStepProps {
  accountId: string;
  orgName: string;
  selectedPlan: PlanInfo;
  billingCycle: "monthly" | "annual";
  trialDays: number;
  isSubmitting: boolean;
  exchangeRate: number;
  onBack: () => void;
  onSuccess: (paymentId: string) => void;
}

function MobileStep({
  accountId,
  orgName,
  selectedPlan,
  billingCycle,
  trialDays,
  isSubmitting,
  exchangeRate,
  onBack,
  onSuccess,
}: MobileStepProps) {
  const { mutateAsync: initMobileTopUp } = useInitMobileTopUp(accountId);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // Compute correct price for summary
  const priceInfo = computePlanPrice(
    {
      monthlyPrice: selectedPlan.priceMonthly,
      yearlyPrice: selectedPlan.priceYearly,
    },
    billingCycle === "annual" ? "yearly" : "monthly",
  );

  // Convert USD to RWF using live rate
  const usdAmount =
    billingCycle === "annual"
      ? selectedPlan.priceYearly * 12
      : selectedPlan.priceMonthly;
  const rwfAmount = Math.round(usdAmount * exchangeRate);

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
        customerName: orgName,
        paymentType: "subscription",
        planId: selectedPlan.id,
        billingCycle: billingCycle === "annual" ? "yearly" : "monthly",
      });

      onSuccess(result.payment.id);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to initiate payment";
      setError(msg);
    } finally {
      setProcessing(false);
    }
  }

  const loading = processing || isSubmitting;

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
        {/* RWF amount */}
        <div className="mt-3 pt-3 border-t border-border flex justify-between text-sm">
          <span className="text-muted-foreground">Amount (RWF)</span>
          <span className="font-semibold">
            {rwfAmount.toLocaleString()} RWF
          </span>
        </div>
      </div>

      {/* Phone number input */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-foreground">
              Mobile Money
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            MTN MoMo or Airtel Money
          </span>
        </div>

        <div>
          <Label htmlFor="phone" className="text-sm font-medium">
            Phone Number
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
              disabled={loading}
              maxLength={9}
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

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
                  {rwfAmount.toLocaleString()} RWF after the trial ends. Cancel
                  anytime.
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
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={handlePay}
          disabled={loading || !phoneNumber.trim()}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Initiating...
            </>
          ) : trialDays > 0 ? (
            `Start ${trialDays}-day trial`
          ) : (
            `Pay ${rwfAmount.toLocaleString()} RWF`
          )}
        </Button>
      </div>
    </>
  );
}

// ── Pending Step (Mobile Payment Confirmation) ───────────────────────────────

interface PendingStepProps {
  accountId: string;
  paymentId: string;
  orgName: string;
  selectedPlan: PlanInfo;
  onSuccess: () => void;
  onFailed: () => void;
}

function PendingStep({
  accountId,
  paymentId,
  orgName,
  selectedPlan,
  onSuccess,
  onFailed,
}: PendingStepProps) {
  const { confirmed, failed, timedOut } = useMobilePaymentConfirmation(
    accountId,
    paymentId,
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
            <p className="font-semibold text-lg">Payment Successful!</p>
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
            <p className="font-semibold text-lg">Check your phone</p>
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [mobilePaymentId, setMobilePaymentId] = useState<string | null>(null);

  const { data: plansData, isLoading: plansLoading } = usePublicPlans();
  const { data: exchangeRate } = useExchangeRate();

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

  const handlePaidSubmit = (paymentMethodId: string, customerId: string) => {
    onSubmit({
      name: orgName.trim(),
      planId: selectedPlan!.id,
      billingCycle,
      paymentMethodId,
      customerId,
    });
  };

  const handleMobileSuccess = (paymentId: string) => {
    setMobilePaymentId(paymentId);
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
    setMobilePaymentId(null);
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
        <div className="space-y-4">
          {/* Summary */}
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
                  {
                    computePlanPrice(
                      {
                        monthlyPrice: selectedPlan.priceMonthly,
                        yearlyPrice: selectedPlan.priceYearly,
                      },
                      billingCycle === "annual" ? "yearly" : "monthly",
                    ).display
                  }
                </p>
              </div>
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
                <p className="font-medium text-foreground">Credit/Debit Card</p>
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
                <p className="font-medium text-foreground">Mobile Money</p>
                <p className="text-xs text-muted-foreground">
                  MTN MoMo, Airtel Money
                </p>
              </div>
            </button>
          </div>

          <Button
            variant="outline"
            onClick={() => setStep("plan")}
            className="gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Button>
        </div>
      )}

      {/* ── Step 3a: Card Payment ─────────────────────────────────────────────── */}
      {step === "card" && isPaidPlan && selectedPlan && (
        <Elements stripe={stripePromise}>
          <PaidCardStep
            accountId={accountId}
            email={email}
            name={name}
            orgName={orgName}
            selectedPlan={selectedPlan}
            billingCycle={billingCycle}
            trialDays={trialDays}
            isSubmitting={isSubmitting}
            onBack={() => setStep("method")}
            onSubmit={handlePaidSubmit}
          />
        </Elements>
      )}

      {/* ── Step 3b: Mobile Money ─────────────────────────────────────────────── */}
      {step === "mobile" && isPaidPlan && selectedPlan && (
        <MobileStep
          accountId={accountId}
          orgName={orgName}
          selectedPlan={selectedPlan}
          billingCycle={billingCycle}
          trialDays={trialDays}
          isSubmitting={isSubmitting}
          exchangeRate={exchangeRate}
          onBack={() => setStep("method")}
          onSuccess={handleMobileSuccess}
        />
      )}

      {/* ── Step 4: Pending (Mobile Payment Confirmation) ─────────────────────── */}
      {step === "pending" && selectedPlan && mobilePaymentId && (
        <PendingStep
          accountId={accountId}
          paymentId={mobilePaymentId}
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
