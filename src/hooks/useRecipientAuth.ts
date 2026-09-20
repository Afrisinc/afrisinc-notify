import { useMutation } from "@tanstack/react-query";
import {
  requestAccessService,
  setPasswordService,
  recipientLoginService,
  recipientForgotPasswordService,
  recipientResetPasswordService,
} from "@/services/recipientAuth";
import type {
  RecipientRequestAccessSchemaType,
  RecipientLoginSchemaType,
  RecipientForgotPasswordSchemaType,
} from "@/lib/schemas/recipientAuth";

export function useRequestAccess() {
  return useMutation({
    mutationFn: (params: RecipientRequestAccessSchemaType) =>
      requestAccessService(params),
  });
}

export function useSetPassword() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      setPasswordService(token, password),
  });
}

export function useRecipientLogin() {
  return useMutation({
    mutationFn: (params: RecipientLoginSchemaType) =>
      recipientLoginService(params),
  });
}

export function useRecipientForgotPassword() {
  return useMutation({
    mutationFn: (params: RecipientForgotPasswordSchemaType) =>
      recipientForgotPasswordService(params),
  });
}

export function useRecipientResetPassword() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      recipientResetPasswordService(token, password),
  });
}
