import { useMutation } from '@tanstack/react-query';
import {
  directLoginService,
  registrationService,
  signupService,
  verifyEmailService,
  forgotPasswordService,
  resetPasswordService,
} from '@/services/auth';
import type { LoginSchemaType, RegisterSchemaType } from '@/lib/schemas/auth';
import type { SignupPayload } from '@/components/auth/signup/schemas';



/**
 * Direct email/password login mutation
 * Stores notify_token and notify_user in localStorage on success
 */
export function useDirectLogin() {
  return useMutation({
    mutationFn: (params: LoginSchemaType) => directLoginService(params),
  });
}

/**
 * User registration mutation (simple email/password registration)
 */
export function useRegister() {
  return useMutation({
    mutationFn: (params: RegisterSchemaType) => registrationService(params),
  });
}

/**
 * Multi-step signup mutation (with account type and company details)
 */
export function useSignup() {
  return useMutation({
    mutationFn: (payload: SignupPayload) => signupService(payload),
  });
}

/**
 * Email verification mutation
 */
export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => verifyEmailService(token),
  });
}

/**
 * Forgot password (password reset request) mutation
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => forgotPasswordService(email),
  });
}

/**
 * Reset password confirmation mutation
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      resetPasswordService(token, password),
  });
}
