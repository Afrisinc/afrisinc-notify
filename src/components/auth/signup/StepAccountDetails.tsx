import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  accountDetailsSchema,
  type AccountDetailsValues,
  type AccountType,
} from "./schemas";
import { Loader2 } from "lucide-react";
import FormInput from "@/components/auth/FormInput";
import FormCheckbox from "@/components/auth/FormCheckbox";

interface StepAccountDetailsProps {
  accountType: AccountType;
  defaultValues: Partial<AccountDetailsValues>;
  onSubmit: (values: AccountDetailsValues) => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const StepAccountDetails = ({
  accountType,
  defaultValues,
  onSubmit,
  onBack,
  isSubmitting,
}: StepAccountDetailsProps) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [validationError, setValidationError] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AccountDetailsValues>({
    resolver: zodResolver(accountDetailsSchema),
    defaultValues,
    mode: "onChange",
  });

  const handleFormSubmit = (values: AccountDetailsValues) => {
    setValidationError("");

    // Validate company account required fields
    if (accountType === "company") {
      if (!values.organizationName?.trim()) {
        setValidationError("Organization name is required");
        return;
      }
      if (!values.companyEmail?.trim()) {
        setValidationError("Company email is required");
        return;
      }
    }

    onSubmit(values);
  };

  const orgName = watch("organizationName");
  const slug = orgName
    ? orgName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    : "";

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {accountType === "personal" ? (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-blue-700 dark:text-blue-400 text-sm">
            Personal account setup complete! You're all set to start using Notify.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <FormInput
              id="organizationName"
              label="Organization Name"
              placeholder="Your company name"
              error={errors.organizationName?.message}
              {...register("organizationName")}
            />
            {slug && (
              <p className="text-secondary text-sm">
                Slug: <span className="font-mono text-foreground">{slug}</span>
              </p>
            )}
          </div>

          <FormInput
            id="companyEmail"
            label="Company Email"
            type="email"
            placeholder="company@example.com"
            error={errors.companyEmail?.message}
            {...register("companyEmail")}
          />
        </>
      )}

      {validationError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-red-700 dark:text-red-400 text-sm font-medium">
            {validationError}
          </p>
        </div>
      )}

      <FormCheckbox
        checked={termsAccepted}
        onChange={(e) => setTermsAccepted(e.target.checked)}
        label={
          <span className="text-secondary text-sm">
            I agree to the{" "}
            <Link to="/terms" className="form-link">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="form-link">
              Privacy Policy
            </Link>
          </span>
        }
        containerClassName="flex items-start gap-2"
        labelClassName="text-secondary text-sm"
      />

      <div className="flex gap-3">
        <Button
          type="button"
          variant="primary-light"
          className="flex-1"
          onClick={onBack}
          disabled={isSubmitting}
        >
          ← Back
        </Button>
        <Button
          variant="default"
          type="submit"
          className="flex-1"
          disabled={isSubmitting || !termsAccepted}
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
    </form>
  );
};

export default StepAccountDetails;
