import { useMutation, useQuery } from '@tanstack/react-query';
import {
  directLoginService,
  registrationService,
  signupService,
  verifyEmailService,
  forgotPasswordService,
  resetPasswordService,
  getUserOrganizationsService,
  getUserAppsService,
  getUserProfileService,
} from '@/services/auth';
import type { LoginSchemaType, RegisterSchemaType } from '@/lib/schemas/auth';
import type { SignupPayload } from '@/components/auth/signup/schemas';
import { useOrg } from '@/contexts/OrgContext';
import { useUser } from '@/contexts/UserContext';



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

/**
 * Get user organizations and apps
 */
export function useUserOrganizations(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['userOrganizations'],
    queryFn: () => getUserOrganizationsService(),
    enabled: options?.enabled ?? true,
  });
}

/**
 * Get user apps
 */
export function useUserApps(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['userApps'],
    queryFn: () => getUserAppsService(),
    enabled: options?.enabled ?? true,
  });
}

/**
 * Get user profile
 */
export function useUserProfile(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: () => getUserProfileService(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: options?.enabled ?? true,
  });
}

/**
 * Get account ID for the current organization
 * Combines OrgContext (currentOrg) with UserContext (getAccountIdForOrg)
 * Returns null if organization is not selected or account not found
 */
export function useCurrentAccountId(): string | null {
  try {
    const { currentOrg } = useOrg();
    const { getAccountIdForOrg } = useUser();

    if (!currentOrg?.id) {
      console.warn('No current organization selected');
      return null;
    }

    const accountId = getAccountIdForOrg(currentOrg.id);
    if (!accountId) {
      console.warn(`No account found for organization: ${currentOrg.id}`);
    }
    return accountId;
  } catch (error) {
    console.warn('Could not get current account ID:', error);
    return null;
  }
}
