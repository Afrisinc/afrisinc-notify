import getApiClient from "./apiClient";
import type {
  CreateAppPayload,
  CreateAppTemplatePayload,
  AppTemplateResponse,
  AppTemplatesResponse,
  AppOverview,
  OrganizationAppsDetailsResponse,
  AppNotificationsResponse,
  CreateApiKeyPayload,
  ApiKey,
  ApiKeysResponse,
  CreateApiKeyResponse,
} from "@/types/apps";

// Re-export all types from dedicated types file for backward compatibility
export type {
  CreateAppPayload,
  CreateAppTemplatePayload,
  AppTemplateResponse,
  AppTemplatesResponse,
  NotificationDataPoint,
  AppOverview,
  OrganizationAppDetails,
  OrganizationAppsDetailsResponse,
  NotificationProviderLog,
  AppNotification,
  AppNotificationsSummary,
  AppNotificationsResponse,
  CreateApiKeyPayload,
  ApiKey,
  ApiKeysResponse,
  CreateApiKeyResponse,
} from "@/types/apps";

/**
 * Create a new app
 */
export const createAppService = async (payload: CreateAppPayload) => {
  const { data } = await getApiClient().post(
    "/api/apps",
    {
      name: payload.name,
      orgId: payload.orgId,
      environment: payload.environment || "development",
      description: payload.description,
    },
    {
      headers: {
        "x-account-id": payload.accountId,
      },
    },
  );
  return data.data;
};

/**
 * Get all apps (filtered by organization)
 * Includes x-account-id header if provided, or x-organization-id for invited members
 */
export const getAppsService = async (orgId: string) => {
  const { data } = await getApiClient().get(`/api/organizations/${orgId}/apps`);
  return data.data;
};

/**
 * Get single app by ID
 * Uses organization-based endpoint: /organizations/:orgId/apps/:appId
 */
export const getAppService = async (appId: string, orgId: string) => {
  const { data } = await getApiClient().get(
    `/api/organizations/${orgId}/apps/${appId}`,
  );
  return data.data;
};

/**
 * Get app overview with statistics and chart data
 * Uses organization-based endpoint: /organizations/:orgId/apps/:appId/overview
 */
export const getAppOverviewService = async (appId: string, orgId: string) => {
  const { data } = await getApiClient().get(
    `/api/organizations/${orgId}/apps/${appId}/overview`,
  );
  return data.data as AppOverview;
};

/**
 * Update app
 * Uses organization-based endpoint: /organizations/:orgId/apps/:appId
 */
export const updateAppService = async (
  appId: string,
  orgId: string,
  payload: Partial<CreateAppPayload>,
) => {
  const { data } = await getApiClient().patch(
    `/api/organizations/${orgId}/apps/${appId}`,
    payload,
  );
  return data.data;
};

/**
 * Delete app
 * Uses organization-based endpoint: /organizations/:orgId/apps/:appId
 */
export const deleteAppService = async (appId: string, orgId: string) => {
  const { data } = await getApiClient().delete(
    `/api/organizations/${orgId}/apps/${appId}`,
  );
  return data.data;
};

// ──────────────────────────────────────────
// APP TEMPLATE ENDPOINTS
// ──────────────────────────────────────────

/**
 * Create app template
 * POST /api/organizations/:orgId/apps/:appId/templates
 */
export const createAppTemplateService = async (
  appId: string,
  payload: CreateAppTemplatePayload,
  orgId: string,
) => {
  const { data } = await getApiClient().post(
    `/api/organizations/${orgId}/apps/${appId}/templates`,
    payload,
  );
  return data.data;
};

/**
 * Get all app templates
 * GET /api/organizations/:orgId/apps/:appId/templates
 */
export const getAppTemplatesService = async (appId: string, orgId: string) => {
  const { data } = await getApiClient().get<any>(
    `/api/organizations/${orgId}/apps/${appId}/templates`,
  );
  return data.data as AppTemplatesResponse;
};

/**
 * Get app template by ID
 * GET /api/organizations/:orgId/apps/:appId/templates/:templateId
 */
export const getAppTemplateService = async (
  appId: string,
  templateId: string,
  orgId: string,
) => {
  const { data } = await getApiClient().get<any>(
    `/api/organizations/${orgId}/apps/${appId}/templates/${templateId}`,
  );
  return data.data as AppTemplateResponse;
};

/**
 * Update app template
 * PUT /api/organizations/:orgId/apps/:appId/templates/:templateId
 */
export const updateAppTemplateService = async (
  appId: string,
  templateId: string,
  payload: Partial<CreateAppTemplatePayload>,
  orgId: string,
) => {
  const { data } = await getApiClient().put<any>(
    `/api/organizations/${orgId}/apps/${appId}/templates/${templateId}`,
    payload,
  );
  return data.data as AppTemplateResponse;
};

/**
 * Delete app template
 * DELETE /api/organizations/:orgId/apps/:appId/templates/:templateId
 */
/**
 * Delete app template
 * DELETE /api/organizations/:orgId/apps/:appId/templates/:templateId
 */
export const deleteAppTemplateService = async (
  appId: string,
  templateId: string,
  orgId: string,
) => {
  const { data } = await getApiClient().delete<any>(
    `/api/organizations/${orgId}/apps/${appId}/templates/${templateId}`,
  );
  return data.data;
};

// ──────────────────────────────────────────
// APP NOTIFICATIONS LOGS
// ──────────────────────────────────────────

/**
 * Get app notification logs
 * GET /api/organizations/:orgId/apps/:appId/notifications
 */
export const getAppNotificationsService = async (
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
  orgId?: string,
) => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.status) queryParams.append("status", params.status);
  if (params?.channel) queryParams.append("channel", params.channel);
  if (params?.search) queryParams.append("search", params.search);
  if (params?.dateFrom) queryParams.append("dateFrom", params.dateFrom);
  if (params?.dateTo) queryParams.append("dateTo", params.dateTo);
  if (params?.templateId) queryParams.append("templateId", params.templateId);
  if (params?.provider) queryParams.append("provider", params.provider);

  const query = queryParams.toString() ? `?${queryParams.toString()}` : "";

  const { data } = await getApiClient().get<any>(
    `/api/organizations/${orgId}/apps/${appId}/notifications${query}`,
  );
  return data.data as AppNotificationsResponse;
};

// ──────────────────────────────────────────
// API KEYS ENDPOINTS
// ──────────────────────────────────────────

/**
 * Create new API key
 * POST /api/apps/:appId/api-keys
 */
export const createApiKeyService = async (
  appId: string,
  payload: CreateApiKeyPayload,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const { data } = await getApiClient().post<any>(
    `/api/apps/${appId}/api-keys`,
    payload,
    config,
  );
  return data.data as CreateApiKeyResponse;
};

/**
 * Get organization apps with basic details (name, environment, template count, etc.)
 * Supports search filtering
 * GET /organizations/:orgId/apps/details?search=query
 */
export const getAppsByOrganizationDetailsService = async (
  orgId: string,
  search?: string,
) => {
  const params = new URLSearchParams();
  if (search) {
    params.append("search", search);
  }

  const query = params.toString() ? `?${params.toString()}` : "";
  const { data } = await getApiClient().get<any>(
    `/api/organizations/${orgId}/apps/details${query}`,
  );
  return data.data as OrganizationAppsDetailsResponse;
};

/**
 * Get all API keys for an app
 * GET /api/apps/:appId/api-keys
 */
export const getApiKeysService = async (appId: string, accountId?: string) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const { data } = await getApiClient().get<any>(
    `/api/apps/${appId}/api-keys`,
    config,
  );
  return data.data as ApiKeysResponse;
};

/**
 * Get API key details
 * GET /api/apps/:appId/api-keys/:keyId
 */
export const getApiKeyService = async (
  appId: string,
  keyId: string,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const { data } = await getApiClient().get<any>(
    `/api/apps/${appId}/api-keys/${keyId}`,
    config,
  );
  return data.data as ApiKey;
};

/**
 * Delete/revoke API key
 * DELETE /api/apps/:appId/api-keys/:keyId
 */
export const deleteApiKeyService = async (
  appId: string,
  keyId: string,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const { data } = await getApiClient().delete<any>(
    `/api/apps/${appId}/api-keys/${keyId}`,
    config,
  );
  return data.data;
};
