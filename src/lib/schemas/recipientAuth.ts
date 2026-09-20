import { z } from "zod";

export const RecipientRequestAccessSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

export const RecipientLoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const RecipientSetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

export const RecipientForgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

export type RecipientRequestAccessSchemaType = z.infer<
  typeof RecipientRequestAccessSchema
>;
export type RecipientLoginSchemaType = z.infer<typeof RecipientLoginSchema>;
export type RecipientSetPasswordSchemaType = z.infer<
  typeof RecipientSetPasswordSchema
>;
export type RecipientForgotPasswordSchemaType = z.infer<
  typeof RecipientForgotPasswordSchema
>;
