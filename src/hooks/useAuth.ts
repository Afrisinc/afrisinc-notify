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
    onSuccess: (data: any) => {
      if (data?.data?.token) {
        localStorage.setItem("notify_token", data.data.token);
        localStorage.setItem(
          "notify_user",
          JSON.stringify({
            id: data.data.user_id,
            email: data.data.email,
          })
        );
      }
    },
  });
}

/**
 * User registration mutation (simple email/password registration)
 * Stores notify_token and notify_user in localStorage on success
 */
export function useRegister() {
  return useMutation({
    mutationFn: (params: RegisterSchemaType) => registrationService(params),
    onSuccess: (data: any) => {
      if (data?.data?.token) {
        localStorage.setItem("notify_token", data.data.token);
        localStorage.setItem(
          "notify_user",
          JSON.stringify({
            id: data.data.user_id,
            email: data.data.email,
          })
        );
      }
    },
  });
}

/**
 * Multi-step signup mutation (with account type and company details)
 * Stores notify_token and notify_user in localStorage on success
 */
export function useSignup() {
  return useMutation({
    mutationFn: (payload: SignupPayload) => signupService(payload),
    onSuccess: (data: any) => {
      if (data?.data?.token) {
        localStorage.setItem("notify_token", data.data.token);
        localStorage.setItem(
          "notify_user",
          JSON.stringify({
            id: data.data.user_id,
            email: data.data.email,
          })
        );
      }
    },
    onError: (error: any) => {
      console.error("Signup error:", {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
    },
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
