import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAppService,
  getAppsService,
  getAppService,
  updateAppService,
  deleteAppService,
  type CreateAppPayload,
} from "@/services/apps";
import { useUser } from "@/contexts/UserContext";

/**
 * Create a new app
 * Automatically includes x-account-id header based on selected organization
 * Refetches organization apps after successful creation
 */
export function useCreateApp() {
  const { getAccountIdForOrg } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<CreateAppPayload, "accountId">) => {
      // Get account ID for the selected organization
      const accountId = getAccountIdForOrg(payload.orgId);
      if (!accountId) {
        throw new Error(`No account found for organization ${payload.orgId}`);
      }

      return createAppService({
        ...payload,
        accountId,
      });
    },
    onSuccess: (_data, variables) => {
      // Invalidate organization apps query to refetch
      queryClient.invalidateQueries({
        queryKey: ["organizationApps", variables.orgId],
      });
    },
  });
}

/**
 * Get all apps
 */
export function useApps(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["apps"],
    queryFn: () => getAppsService(),
    enabled: options?.enabled ?? true,
  });
}

/**
 * Get single app by ID
 */
export function useApp(appId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["app", appId],
    queryFn: () => getAppService(appId),
    enabled: (options?.enabled ?? true) && !!appId,
  });
}

/**
 * Update app
 */
export function useUpdateApp() {
  return useMutation({
    mutationFn: ({ appId, payload }: { appId: string; payload: Partial<CreateAppPayload> }) =>
      updateAppService(appId, payload),
  });
}

/**
 * Delete app
 */
export function useDeleteApp() {
  return useMutation({
    mutationFn: (appId: string) => deleteAppService(appId),
  });
}
