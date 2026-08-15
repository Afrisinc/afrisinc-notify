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
  duplicateAppTemplateService,
  deleteAppTemplateService,
  getAppNotificationsService,
  createApiKeyService,
  getApiKeysService,
  getApiKeyService,
  deleteApiKeyService,
  getAppsByOrganizationDetailsService,
} from "@/services/apps";
import type {
  CreateAppPayload,
  CreateAppTemplatePayload,
  DuplicateAppTemplateResponse,
  CreateApiKeyPayload,
} from "@/types/apps";
import { useUser } from "@/contexts/UserContext";
import { useOrg } from "@/contexts/OrgContext";
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
      // Refetch apps with the specific organization ID
      queryClient.refetchQueries({
        queryKey: ["apps", variables.orgId],
      });
      // Also refetch the organization apps details
      queryClient.refetchQueries({
        queryKey: ["organizationAppsDetails", variables.orgId],
      });
    },
  });
}

/**
 * Get all apps
 * Uses organization ID to fetch apps for all organization members
 * Requires organization to be selected
 */
export function useApps(options?: { enabled?: boolean }) {
  const { currentOrg } = useOrg();

  return useQuery({
    queryKey: ["apps", currentOrg?.id],
    queryFn: () => {
      if (!currentOrg?.id) {
        throw new Error("Organization must be selected to fetch apps");
      }
      return getAppsService(currentOrg.id);
    },
    enabled: (options?.enabled ?? true) && !!currentOrg?.id,
  });
}

/**
 * Get single app by ID
 * Uses organization ID to fetch app
 */
export function useApp(appId: string, options?: { enabled?: boolean }) {
  const { currentOrg } = useOrg();

  return useQuery({
    queryKey: ["app", appId, currentOrg?.id],
    queryFn: () => {
      if (!currentOrg?.id) {
        throw new Error("Organization must be selected to fetch app");
      }
      return getAppService(appId, currentOrg.id);
    },
    enabled: (options?.enabled ?? true) && !!appId && !!currentOrg?.id,
  });
}

/**
 * Get app overview with statistics and chart data
 * Uses organization ID to fetch app overview
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
  const { currentOrg } = useOrg();

  return useQuery({
    queryKey: ["appOverview", appId, currentOrg?.id, params],
    queryFn: () => {
      if (!currentOrg?.id) {
        throw new Error("Organization must be selected to fetch app overview");
      }

      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append("startDate", params.startDate);
      if (params?.endDate) queryParams.append("endDate", params.endDate);
      if (params?.channels?.length)
        queryParams.append("channels", params.channels.join(","));

      const query = queryParams.toString() ? `?${queryParams.toString()}` : "";

      return getAppOverviewService(`${appId}${query}`, currentOrg.id);
    },
    enabled: (options?.enabled ?? true) && !!appId && !!currentOrg?.id,
  });
}

/**
 * Update app
 */
export function useUpdateApp() {
  const { currentOrg } = useOrg();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appId,
      payload,
    }: {
      appId: string;
      payload: Partial<CreateAppPayload>;
    }) => {
      if (!currentOrg?.id) {
        throw new Error("Organization must be selected to update app");
      }
      return updateAppService(appId, currentOrg.id, payload);
    },
    onSuccess: (_data, { appId }) => {
      // Refetch the specific app and apps list
      if (currentOrg?.id) {
        queryClient.refetchQueries({
          queryKey: ["app", appId, currentOrg.id],
        });
        queryClient.refetchQueries({
          queryKey: ["apps", currentOrg.id],
        });
      }
    },
  });
}

/**
 * Delete app
 */
export function useDeleteApp() {
  const { currentOrg } = useOrg();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appId: string) => {
      if (!currentOrg?.id) {
        throw new Error("Organization must be selected to delete app");
      }
      return deleteAppService(appId, currentOrg.id);
    },
    onSuccess: () => {
      // Refetch apps list after deletion
      if (currentOrg?.id) {
        queryClient.refetchQueries({
          queryKey: ["apps", currentOrg.id],
        });
        // Also refetch organization apps details
        queryClient.refetchQueries({
          queryKey: ["organizationAppsDetails", currentOrg.id],
        });
      }
    },
  });
}

// ──────────────────────────────────────────
// APP TEMPLATE HOOKS
// ──────────────────────────────────────────

/**
 * Get all app templates
 * Uses organization ID to fetch templates
 */
export function useAppTemplates(
  appId: string,
  options?: { enabled?: boolean },
) {
  const { currentOrg } = useOrg();

  return useQuery({
    queryKey: ["appTemplates", appId, currentOrg?.id],
    queryFn: () => {
      if (!currentOrg?.id) {
        throw new Error("Organization must be selected to fetch templates");
      }
      return getAppTemplatesService(appId, currentOrg.id);
    },
    enabled: (options?.enabled ?? true) && !!appId && !!currentOrg?.id,
  });
}

/**
 * Get single app template by ID
 * Uses organization ID to fetch template
 */
export function useAppTemplate(
  appId: string,
  templateId: string,
  options?: { enabled?: boolean },
) {
  const { currentOrg } = useOrg();

  return useQuery({
    queryKey: ["appTemplate", appId, templateId, currentOrg?.id],
    queryFn: () => {
      if (!currentOrg?.id) {
        throw new Error("Organization must be selected to fetch template");
      }
      return getAppTemplateService(appId, templateId, currentOrg.id);
    },
    enabled:
      (options?.enabled ?? true) && !!appId && !!templateId && !!currentOrg?.id,
  });
}

/**
 * Create app template
 */
export function useCreateAppTemplate() {
  const { currentOrg } = useOrg();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appId,
      payload,
    }: {
      appId: string;
      payload: CreateAppTemplatePayload;
    }) => {
      if (!currentOrg?.id) {
        throw new Error("Organization must be selected to create template");
      }
      return createAppTemplateService(appId, payload, currentOrg.id);
    },
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
  const { currentOrg } = useOrg();
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
    }) => {
      if (!currentOrg?.id) {
        throw new Error("Organization must be selected to update template");
      }
      return updateAppTemplateService(
        appId,
        templateId,
        payload,
        currentOrg.id,
      );
    },
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
 * Duplicate app template
 */
export function useDuplicateAppTemplate() {
  const { currentOrg } = useOrg();
  const queryClient = useQueryClient();

  return useMutation<
    DuplicateAppTemplateResponse,
    Error,
    { appId: string; templateId: string }
  >({
    mutationFn: ({
      appId,
      templateId,
    }: {
      appId: string;
      templateId: string;
    }) => {
      if (!currentOrg?.id) {
        throw new Error("Organization must be selected to duplicate template");
      }
      return duplicateAppTemplateService(appId, templateId, currentOrg.id);
    },
    onSuccess: (_data, { appId, templateId }) => {
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
  const { currentOrg } = useOrg();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appId,
      templateId,
    }: {
      appId: string;
      templateId: string;
    }) => {
      if (!currentOrg?.id) {
        throw new Error("Organization must be selected to delete template");
      }
      return deleteAppTemplateService(appId, templateId, currentOrg.id);
    },
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
 * Uses organization ID to fetch notifications
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
  const { currentOrg } = useOrg();

  return useQuery({
    queryKey: ["appNotifications", appId, currentOrg?.id, params],
    queryFn: () => {
      if (!currentOrg?.id) {
        throw new Error("Organization must be selected to fetch notifications");
      }
      return getAppNotificationsService(appId, params, currentOrg.id);
    },
    enabled: (options?.enabled ?? true) && !!appId && !!currentOrg?.id,
  });
}

// ──────────────────────────────────────────
// API KEYS HOOKS
// ──────────────────────────────────────────

/**
 * Create API key
 */
export function useCreateApiKey() {
  const { currentOrg } = useOrg();
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appId,
      payload,
    }: {
      appId: string;
      payload: CreateApiKeyPayload;
    }) => {
      if (!currentOrg?.id) {
        throw new Error("Organization must be selected to create API key");
      }
      return createApiKeyService(
        appId,
        currentOrg.id,
        payload,
        accountId ?? undefined,
      );
    },
    onSuccess: (_data, { appId }) => {
      queryClient.invalidateQueries({
        queryKey: ["apiKeys", appId],
      });
    },
  });
}

/**
 * Get all API keys for an app
 * Automatically includes x-account-id header from current organization
 */
export function useApiKeys(appId: string, options?: { enabled?: boolean }) {
  const { currentOrg } = useOrg();
  const accountId = useCurrentAccountId();

  return useQuery({
    queryKey: ["apiKeys", appId, accountId],
    queryFn: () => {
      if (!currentOrg?.id) {
        throw new Error("Organization must be selected to fetch API keys");
      }
      return getApiKeysService(appId, currentOrg.id, accountId ?? undefined);
    },
    enabled:
      (options?.enabled ?? true) && !!appId && !!accountId && !!currentOrg?.id,
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
      queryClient.invalidateQueries({
        queryKey: ["apiKeys", appId],
      });
    },
  });
}

// ──────────────────────────────────────────
// ORGANIZATION APPS HOOKS
// ──────────────────────────────────────────

/**
 * Get organization apps with basic details (optimized for listing)
 * Supports search filtering
 */
export function useAppsByOrganizationDetails(
  orgId: string,
  search?: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["organizationAppsDetails", orgId, search],
    queryFn: () => getAppsByOrganizationDetailsService(orgId, search),
    enabled: (options?.enabled ?? true) && !!orgId,
  });
}
