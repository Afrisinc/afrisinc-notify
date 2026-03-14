import { z } from "zod";

export const identitySchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  lastName: z.string().trim().min(1, "Last name is required").max(50),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  location: z.string().trim().max(100).optional().or(z.literal("")),
  phone: z.string().trim().regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, "Please enter a valid phone number").max(25).or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const accountDetailsSchema = z.object({
  displayName: z.string().trim().max(100).optional(),
  organizationName: z.string().trim().min(1, "Organization name is required").max(100).optional(),
  jobTitle: z.string().trim().max(100).optional(),
  industry: z.string().trim().max(100).optional(),
  companyEmail: z.string().trim().min(1, "Company email is required").email("Please enter a valid email address").max(255).optional(),
  companySize: z.string().trim().max(50).optional(),
  website: z.string().trim().max(255).optional().refine(
    (val) => !val || /^https?:\/\/.+/.test(val),
    "Please enter a valid URL (starting with http:// or https://)"
  ),
});

export type IdentityValues = z.infer<typeof identitySchema>;
export type AccountDetailsValues = z.infer<typeof accountDetailsSchema>;
export type AccountType = "personal" | "company";

export interface SignupPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location?: string;
  password: string;
  account_type: AccountType;
  account_name: string;
  product_code?: string;
  displayName?: string;
  organizationName?: string;
  jobTitle?: string;
  industry?: string;
  companyEmail?: string;
  companySize?: string;
  website?: string;
}
