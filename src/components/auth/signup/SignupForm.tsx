import { useState, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSignup } from "@/hooks/useAuth";
import SignupStepper from "./SignupStepper";
import StepIdentity from "./StepIdentity";
import StepAccountType from "./StepAccountType";
import StepAccountDetails from "./StepAccountDetails";
import type { IdentityValues, AccountDetailsValues, AccountType, SignupPayload } from "./schemas";
import Logo from "@/components/Logo";

const TOTAL_STEPS = 3;

const SignupForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productCode = searchParams.get("product") || undefined;
  const redirectUri = searchParams.get("redirect_uri") || undefined;

  const [step, setStep] = useState(0);
  const [identityData, setIdentityData] = useState<Partial<IdentityValues>>({});
  const [accountType, setAccountType] = useState<AccountType | null>(null);

  const { mutate, isPending } = useSignup();

  const handleSignupSuccess = useCallback((res: any) => {
    if (res.success && res.resp_code === 1000) {
      toast.success("Account created! You can now sign in.");
      const destination = redirectUri
        ? `/login?redirect_uri=${encodeURIComponent(redirectUri)}${productCode ? `&product=${productCode}` : ""}`
        : "/login";
      navigate(destination);
    } else {
      toast.error(res.resp_msg || "Registration failed. Please try again.");
    }
  }, [redirectUri, productCode, navigate]);

  const handleSignupError = useCallback((error: any) => {
    // Extract error message from Axios error response or generic error
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

  const handleFinalSubmit = useCallback((values: AccountDetailsValues) => {
    if (!accountType) return;

    const payload: SignupPayload = {
      firstName: identityData.firstName!,
      lastName: identityData.lastName!,
      email: identityData.email!,
      password: identityData.password!,
      phone: identityData.phone,
      location: identityData.location || undefined,
      account_type: accountType,
      account_name: accountType === "company"
        ? values.organizationName || ""
        : values.displayName || `${identityData.firstName || ""} ${identityData.lastName || ""}`.trim(),
      product_code: productCode,
      displayName: values.displayName,
      organizationName: values.organizationName,
      jobTitle: values.jobTitle,
      companyEmail: values.companyEmail || undefined,
      industry: values.industry,
      companySize: values.companySize,
      website: values.website || undefined,
    };

    mutate(payload, {
      onSuccess: handleSignupSuccess,
      onError: handleSignupError,
    });
  }, [accountType, identityData, productCode, mutate, handleSignupSuccess, handleSignupError]);

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Logo */}
      <div className="text-center mb-8">
       <Logo/>
        <h1 className="heading-subsection">Create your account</h1>
        <p className="heading-description">Join Nofiyr today</p>
      </div>

      {/* Product badge */}
      {productCode && (
        <div className="flex justify-center">
          <Badge variant="secondary">
            You're signing up for {productCode.charAt(0).toUpperCase() + productCode.slice(1).toLowerCase()}
          </Badge>
        </div>
      )}

      {/* Stepper */}
      <SignupStepper currentStep={step} totalSteps={TOTAL_STEPS} />

      {/* Form card */}
      <div className="bg-card rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-shadow">
        {step === 0 && (
          <StepIdentity defaultValues={identityData} onNext={handleIdentityNext} />
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
            defaultValues={{}}
            onSubmit={handleFinalSubmit}
            onBack={() => setStep(1)}
            isSubmitting={isPending}
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
