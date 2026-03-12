import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { accountDetailsSchema, type AccountDetailsValues, type AccountType } from "./schemas";
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

const companySizes = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "500+",
];

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
    setValue,
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
    ? orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    : "";

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {accountType === "personal" ? (
        <FormInput
          id="displayName"
          label="Display Name (optional)"
          placeholder="How you'd like to be known"
          error={errors.displayName?.message}
          {...register("displayName")}
        />
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
            id="jobTitle"
            label="Your Job Title (optional)"
            placeholder="e.g. CTO, Product Manager"
            error={errors.jobTitle?.message}
            {...register("jobTitle")}
          />

          <FormInput
            id="companyEmail"
            label="Company Email"
            type="email"
            placeholder="company@example.com"
            error={errors.companyEmail?.message}
            {...register("companyEmail")}
          />

          <FormInput
            id="industry"
            label="Industry (optional)"
            placeholder="e.g. Fintech, Healthcare"
            error={errors.industry?.message}
            {...register("industry")}
          />

          <div className="space-y-2">
            <Label className="heading-label">
              Company Size <span className="text-secondary font-normal text-sm">(optional)</span>
            </Label>
            <Select onValueChange={(val) => setValue("companySize", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select company size" />
              </SelectTrigger>
              <SelectContent>
                {companySizes.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size} employees
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <FormInput
            id="website"
            label="Website (optional)"
            placeholder="https://yourcompany.com"
            error={errors.website?.message}
            {...register("website")}
          />
        </>
      )}

      {validationError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-red-700 dark:text-red-400 text-sm font-medium">{validationError}</p>
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
        <Button type="button" variant="primary-light" className="flex-1" onClick={onBack} disabled={isSubmitting}>
          ← Back
        </Button>
        <Button variant="default" type="submit" className="flex-1" disabled={isSubmitting || !termsAccepted}>
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
