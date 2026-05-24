import { z } from "zod";

export const identitySchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required").max(50),
    lastName: z.string().trim().min(1, "Last name is required").max(50),
    email: z
      .string()
      .trim()
      .email("Please enter a valid email address")
      .max(255),
    phone: z
      .string()
      .trim()
      .min(1, "Phone number is required")
      .regex(
        /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
        "Please enter a valid phone number",
      )
      .max(25),
    location: z.string().trim().max(100).optional().or(z.literal("")),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const accountDetailsSchema = z.object({
  organizationName: z
    .string()
    .trim()
    .min(1, "Organization name is required")
    .max(100)
    .optional(),
  companyEmail: z
    .string()
    .trim()
    .min(1, "Company email is required")
    .email("Please enter a valid email address")
    .max(255)
    .optional(),
});

export type IdentityValues = z.infer<typeof identitySchema>;
export type AccountDetailsValues = z.infer<typeof accountDetailsSchema>;
export type AccountType = "personal" | "company";

export interface SignupPayload {
  // From Identity Step - all required
  firstName: string;
  lastName: string;
  email: string;
  phone: string; // Required for all accounts
  password: string;

  // From Account Type Step - required
  account_type: AccountType;

  // From Account Details Step - optional
  location?: string;
  organizationName?: string; // Required for company accounts (validated during submission)
  companyEmail?: string; // Required for company accounts (validated during submission)

  // From Plan Confirmation Step - optional (defaults to FREE if not provided)
  planId?: string;
  billingCycle?: "monthly" | "annual";

  // From Payment Step - required for paid plans
  paymentMethodId?: string;
}

// Plan data structure for signup flow
export interface PlanInfo {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  description: string;
  features: string[];
  trialDays?: number;
}
