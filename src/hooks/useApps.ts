import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAppService,
  getAppsService,
  getAppService,
  getAppOverviewService,
  updateAppService,
  deleteAppService,
  createAppTemplateService,
  getAppTemplatesService,
  getAppTemplateService,
  updateAppTemplateService,
  deleteAppTemplateService,
  getAppNotificationsService,
  createApiKeyService,
  getApiKeysService,
  getApiKeyService,
  deleteApiKeyService,
  type CreateAppPayload,
  type CreateAppTemplatePayload,
  type CreateApiKeyPayload,
} from "@/services/apps";
import { useUser } from "@/contexts/UserContext";
import { useCurrentAccountId } from "@/hooks/useAuth";

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
      // Refetch organization apps and general apps list directly
      queryClient.refetchQueries({
        queryKey: ["organizationApps", variables.orgId],
      });
      queryClient.refetchQueries({
        queryKey: ["apps"],
      });
    },
  });
}

/**
 * Get all apps
 * Automatically includes x-account-id header from current organization
 */
export function useApps(options?: { enabled?: boolean }) {
  const accountId = useCurrentAccountId();

  return useQuery({
    queryKey: ["apps", accountId],
    queryFn: () => getAppsService(accountId ?? undefined),
    enabled: (options?.enabled ?? true) && !!accountId,
  });
}

/**
 * Get single app by ID
 * Automatically includes x-account-id header from current organization
 */
export function useApp(appId: string, options?: { enabled?: boolean }) {
  const accountId = useCurrentAccountId();

  return useQuery({
    queryKey: ["app", appId, accountId],
    queryFn: () => getAppService(appId, accountId ?? undefined),
    enabled: (options?.enabled ?? true) && !!appId && !!accountId,
  });
}

/**
 * Get app overview with statistics and chart data
 * Automatically includes x-account-id header from current organization
 * Supports filtering by date range and channels
 */
export function useAppOverview(
  appId: string,
  params?: {
    startDate?: string;
    endDate?: string;
    channels?: string[];
  },
  options?: { enabled?: boolean },
) {
  const accountId = useCurrentAccountId();

  return useQuery({
    queryKey: ["appOverview", appId, accountId, params],
    queryFn: () => {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append("startDate", params.startDate);
      if (params?.endDate) queryParams.append("endDate", params.endDate);
      if (params?.channels?.length)
        queryParams.append("channels", params.channels.join(","));

      const query = queryParams.toString();
      const url = query ? `${appId}?${query}` : appId;

      return getAppOverviewService(url, accountId ?? undefined);
    },
    enabled: (options?.enabled ?? true) && !!appId && !!accountId,
  });
}

/**
 * Update app
 */
export function useUpdateApp() {
  return useMutation({
    mutationFn: ({
      appId,
      payload,
    }: {
      appId: string;
      payload: Partial<CreateAppPayload>;
    }) => updateAppService(appId, payload),
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

// ──────────────────────────────────────────
// APP TEMPLATE HOOKS
// ──────────────────────────────────────────

/**
 * Get all app templates
 * Automatically includes x-account-id header from current organization
 */
export function useAppTemplates(
  appId: string,
  options?: { enabled?: boolean },
) {
  const accountId = useCurrentAccountId();

  return useQuery({
    queryKey: ["appTemplates", appId, accountId],
    queryFn: () => getAppTemplatesService(appId, accountId ?? undefined),
    enabled: (options?.enabled ?? true) && !!appId && !!accountId,
  });
}

/**
 * Get single app template by ID
 * Automatically includes x-account-id header from current organization
 */
export function useAppTemplate(
  appId: string,
  templateId: string,
  options?: { enabled?: boolean },
) {
  const accountId = useCurrentAccountId();

  return useQuery({
    queryKey: ["appTemplate", appId, templateId, accountId],
    queryFn: () =>
      getAppTemplateService(appId, templateId, accountId ?? undefined),
    enabled:
      (options?.enabled ?? true) && !!appId && !!templateId && !!accountId,
  });
}

/**
 * Create app template
 */
export function useCreateAppTemplate() {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appId,
      payload,
    }: {
      appId: string;
      payload: CreateAppTemplatePayload;
    }) => createAppTemplateService(appId, payload, accountId ?? undefined),
    onSuccess: (_data, { appId }) => {
      // Invalidate app templates query to refetch
      queryClient.invalidateQueries({
        queryKey: ["appTemplates", appId],
      });
    },
  });
}

/**
 * Update app template
 */
export function useUpdateAppTemplate() {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appId,
      templateId,
      payload,
    }: {
      appId: string;
      templateId: string;
      payload: Partial<CreateAppTemplatePayload>;
    }) =>
      updateAppTemplateService(
        appId,
        templateId,
        payload,
        accountId ?? undefined,
      ),
    onSuccess: (_data, { appId, templateId }) => {
      // Invalidate both specific template and templates list
      queryClient.invalidateQueries({
        queryKey: ["appTemplate", appId, templateId],
      });
      queryClient.invalidateQueries({
        queryKey: ["appTemplates", appId],
      });
    },
  });
}

/**
 * Delete app template
 */
export function useDeleteAppTemplate() {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appId,
      templateId,
    }: {
      appId: string;
      templateId: string;
    }) => deleteAppTemplateService(appId, templateId, accountId ?? undefined),
    onSuccess: (_data, { appId, templateId }) => {
      // Invalidate both specific template and templates list
      queryClient.invalidateQueries({
        queryKey: ["appTemplate", appId, templateId],
      });
      queryClient.invalidateQueries({
        queryKey: ["appTemplates", appId],
      });
    },
  });
}

// ──────────────────────────────────────────
// APP NOTIFICATIONS HOOKS
// ──────────────────────────────────────────

/**
 * Get app notification logs
 * Automatically includes x-account-id header from current organization
 */
export function useAppNotifications(
  appId: string,
  params?: {
    page?: number;
    limit?: number;
    status?: "SENT" | "FAILED" | "PENDING" | "BOUNCED" | "QUEUED";
    channel?: "EMAIL" | "SMS" | "PUSH" | "IN_APP" | "WHATSAPP";
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    templateId?: string;
    provider?: string;
  },
  options?: { enabled?: boolean },
) {
  const accountId = useCurrentAccountId();

  return useQuery({
    queryKey: ["appNotifications", appId, accountId, params],
    queryFn: () =>
      getAppNotificationsService(appId, params, accountId ?? undefined),
    enabled: (options?.enabled ?? true) && !!appId && !!accountId,
  });
}

// ──────────────────────────────────────────
// API KEYS HOOKS
// ──────────────────────────────────────────

/**
 * Create API key
 */
export function useCreateApiKey() {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appId,
      payload,
    }: {
      appId: string;
      payload: CreateApiKeyPayload;
    }) => createApiKeyService(appId, payload, accountId ?? undefined),
    onSuccess: (_data, { appId }) => {
      // Invalidate API keys query to refetch
      queryClient.invalidateQueries({
        queryKey: ["apiKeys", appId, accountId],
      });
    },
  });
}

/**
 * Get all API keys for an app
 * Automatically includes x-account-id header from current organization
 */
export function useApiKeys(appId: string, options?: { enabled?: boolean }) {
  const accountId = useCurrentAccountId();

  return useQuery({
    queryKey: ["apiKeys", appId, accountId],
    queryFn: () => getApiKeysService(appId, accountId ?? undefined),
    enabled: (options?.enabled ?? true) && !!appId && !!accountId,
  });
}

/**
 * Get single API key
 * Automatically includes x-account-id header from current organization
 */
export function useApiKey(
  appId: string,
  keyId: string,
  options?: { enabled?: boolean },
) {
  const accountId = useCurrentAccountId();

  return useQuery({
    queryKey: ["apiKey", appId, keyId, accountId],
    queryFn: () => getApiKeyService(appId, keyId, accountId ?? undefined),
    enabled: (options?.enabled ?? true) && !!appId && !!keyId && !!accountId,
  });
}

/**
 * Delete API key
 */
export function useDeleteApiKey() {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appId, keyId }: { appId: string; keyId: string }) =>
      deleteApiKeyService(appId, keyId, accountId ?? undefined),
    onSuccess: (_data, { appId }) => {
      // Invalidate API keys query to refetch
      queryClient.invalidateQueries({
        queryKey: ["apiKeys", appId, accountId],
      });
    },
  });
}
