import { useState, useCallback, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useSignup } from "@/hooks/useAuth";
import { usePublicPlans } from "@/hooks/useSubscription";
import SignupStepper from "./SignupStepper";
import StepIdentity from "./StepIdentity";
import StepAccountType from "./StepAccountType";
import StepAccountDetails from "./StepAccountDetails";
import StepPlanConfirmation from "./StepPlanConfirmation";
import type {
  IdentityValues,
  AccountDetailsValues,
  AccountType,
  SignupPayload,
  PlanInfo,
} from "./schemas";
import type { PaymentData } from "./PaymentMethodForm";
import Logo from "@/components/Logo";

const TOTAL_STEPS = 4;

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
    custom_domain: "custom sending domain",
    webhooks: "webhooks",
    api_access: "API access",
  };
  return labels[metric] || metric.replace(/_/g, " ");
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
    "apps",
    "contacts",
  ];

  for (const metric of keyMetrics) {
    const limit = limits.find((l) => l.metric === metric);
    if (limit) {
      const value = formatLimitValue(limit.limit);
      const label = getMetricLabel(metric);
      if (value === "Unlimited") {
        features.push(`Unlimited ${label.replace(" / mo", "")}`);
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

  return features.slice(0, 6);
};

const SignupForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(0);
  const [identityData, setIdentityData] = useState<Partial<IdentityValues>>({});
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [accountDetails, setAccountDetails] = useState<AccountDetailsValues>(
    {},
  );
  const [selectedPlan, setSelectedPlan] = useState<PlanInfo | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly",
  );

  const { mutate, isPending } = useSignup();
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

  // Set selected plan from URL param or default to FREE
  useEffect(() => {
    if (plans.length > 0 && !selectedPlan) {
      const planParam = searchParams.get("plan")?.toUpperCase();
      const matchedPlan = plans.find((p) => p.name.toUpperCase() === planParam);
      setSelectedPlan(
        matchedPlan || plans.find((p) => p.name === "Free") || plans[0],
      );
    }
  }, [plans, searchParams, selectedPlan]);

  const handleSignupSuccess = useCallback(
    (res: any) => {
      if (res.success && res.resp_code === 1001) {
        toast.success("Account created! Please check your email to verify.");
        const destination = `/registration-success?email=${encodeURIComponent(identityData.email || "")}&type=${accountType}&plan=${selectedPlan?.name || "Free"}`;
        navigate(destination);
      } else {
        toast.error(res.resp_msg || "Registration failed. Please try again.");
      }
    },
    [identityData.email, accountType, selectedPlan, navigate],
  );

  const handleSignupError = useCallback((error: any) => {
    const errorMessage =
      error?.response?.data?.resp_msg ||
      error?.response?.data?.message ||
      error?.message ||
      "Registration failed. Please try again.";
    toast.error(errorMessage);
  }, []);

  const handleIdentityNext = useCallback((values: IdentityValues) => {
    setIdentityData(values);
    setStep(1);
  }, []);

  const handleAccountTypeNext = useCallback(() => {
    setStep(2);
  }, []);

  const handleAccountDetailsNext = useCallback(
    (values: AccountDetailsValues) => {
      if (!accountType) return;

      // Validate company account requirements
      if (accountType === "company") {
        if (!values.organizationName?.trim()) {
          toast.error("Organization name is required for company accounts");
          return;
        }
        if (!values.companyEmail?.trim()) {
          toast.error("Company email is required for company accounts");
          return;
        }
      }

      setAccountDetails(values);
      setStep(3);
    },
    [accountType],
  );

  const handleFinalSubmit = useCallback(
    (paymentData?: PaymentData) => {
      if (!accountType) return;

      // Generate a temporary payment method ID for the backend
      // In production, this would be created via Stripe's createPaymentMethod API
      const paymentMethodId = paymentData
        ? `pm_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
        : undefined;

      const payload: SignupPayload = {
        firstName: identityData.firstName,
        lastName: identityData.lastName,
        email: identityData.email,
        password: identityData.password,
        phone: identityData.phone,
        account_type: accountType,
        // Optional fields - only include if they have values
        ...(identityData.location && { location: identityData.location }),
        ...(accountDetails.organizationName && {
          organizationName: accountDetails.organizationName,
        }),
        ...(accountDetails.companyEmail && {
          companyEmail: accountDetails.companyEmail,
        }),
        // Plan info
        ...(selectedPlan && { planId: selectedPlan.id }),
        billingCycle,
        // Payment info (required for paid plans)
        ...(paymentMethodId && { paymentMethodId }),
      };

      mutate(payload, {
        onSuccess: handleSignupSuccess,
        onError: handleSignupError,
      });
    },
    [
      accountType,
      identityData,
      accountDetails,
      selectedPlan,
      billingCycle,
      mutate,
      handleSignupSuccess,
      handleSignupError,
    ],
  );

  // Show selected plan badge in header
  const planBadge = selectedPlan && selectedPlan.name !== "Free" && (
    <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
      {selectedPlan.name} Plan
      {selectedPlan.trialDays && selectedPlan.trialDays > 0 && (
        <span className="text-primary/70">
          ({selectedPlan.trialDays}-day trial)
        </span>
      )}
    </div>
  );

  return (
    <div
      className={`w-full mx-auto space-y-6 transition-all duration-300 ${
        step === 3 ? "max-w-6xl" : "max-w-md"
      }`}
    >
      {/* Logo */}
      <div className="text-center mb-8">
        <Logo />
        <h1 className="heading-subsection">Create your account</h1>
        <p className="heading-description">Join Nofiyr today</p>
        {planBadge && <div className="mt-3">{planBadge}</div>}
      </div>

      {/* Stepper */}
      <SignupStepper currentStep={step} totalSteps={TOTAL_STEPS} />

      {/* Form card */}
      <div className="bg-card rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-shadow">
        {step === 0 && (
          <StepIdentity
            defaultValues={identityData}
            onNext={handleIdentityNext}
          />
        )}
        {step === 1 && (
          <StepAccountType
            selected={accountType}
            onSelect={setAccountType}
            onNext={handleAccountTypeNext}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && accountType && (
          <StepAccountDetails
            accountType={accountType}
            defaultValues={accountDetails}
            onSubmit={handleAccountDetailsNext}
            onBack={() => setStep(1)}
            isSubmitting={false}
          />
        )}
        {step === 3 && (
          <StepPlanConfirmation
            selectedPlan={selectedPlan}
            plans={plans}
            billingCycle={billingCycle}
            onBillingCycleChange={setBillingCycle}
            onPlanChange={setSelectedPlan}
            onSubmit={handleFinalSubmit}
            onBack={() => setStep(2)}
            isSubmitting={isPending || plansLoading}
          />
        )}
      </div>

      {/* Footer */}
      <p className="heading-description text-center">
        Already have an account?{" "}
        <Link to="/login" className="form-link font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default SignupForm;
