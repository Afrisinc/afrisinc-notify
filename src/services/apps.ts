import getApiClient from "./apiClient";

export interface CreateAppPayload {
  name: string;
  orgId: string;
  accountId: string;
  environment?: "development" | "staging" | "production";
  description?: string;
}

export interface CreateAppTemplatePayload {
  channel: "EMAIL" | "SMS" | "PUSH" | "IN_APP" | "WHATSAPP";
  code: string;
  content: string;
  subject?: string;
  description?: string;
  is_public?: boolean;
  language?: string;
  visibility?: "private" | "public";
  design_json?: any;
  editor_type?: string;
}

export interface AppTemplateResponse {
  installationId: string;
  appId: string;
  status: "active" | "inactive" | "archived";
  customizations: Record<string, any>;
  installationDate: string;
  updatedAt?: string;
  template: {
    id: string;
    code: string;
    channel: string;
    category: string;
    subject?: string;
    content: string;
    language: string;
    version: number;
    active: boolean;
    requiredVariables: string[];
    description?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface AppTemplatesResponse {
  appId: string;
  templates: AppTemplateResponse[];
  total: number;
}

export interface NotificationDataPoint {
  date: string;
  email: number;
  sms: number;
  push: number;
  inApp: number;
}

export interface AppOverview {
  appId: string;
  name: string;
  environment: string;
  stats: {
    totalNotificationsSent: number;
    totalTemplates: number;
    totalApiKeys: number;
    activeApiKeys: number;
  };
  chartData: NotificationDataPoint[];
  recentActivity: {
    totalToday: number;
    totalThisWeek: number;
    totalThisMonth: number;
  };
}

export interface OrganizationAppDetails {
  id: string;
  name: string;
  environment: "production" | "staging" | "development";
  status: string;
  createdAt: string;
  templateCount: number;
  templatesSent: number;
}

export interface OrganizationAppsDetailsResponse {
  organization_id: string;
  apps: OrganizationAppDetails[];
  total: number;
}

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
export const getAppsService = async (accountId?: string, orgId?: string) => {
  const config: any = {};
  if (accountId) {
    config.headers = { "x-account-id": accountId };
  } else if (orgId) {
    config.headers = { "x-organization-id": orgId };
  }
  const { data } = await getApiClient().get("/api/apps", config);
  return data.data;
};

/**
 * Get single app by ID
 * Uses new endpoint format: /organizations/:orgId/apps/:appId (no headers needed)
 * Falls back to old format with headers for backwards compatibility
 */
export const getAppService = async (appId: string, accountId?: string, orgId?: string) => {
  // If organization ID is provided, use new endpoint format
  if (orgId) {
    const { data } = await getApiClient().get(`/api/organizations/${orgId}/apps/${appId}`);
    return data.data;
  }

  // Otherwise use old format with account ID header
  const config: any = {};
  if (accountId) {
    config.headers = { "x-account-id": accountId };
  }
  const { data } = await getApiClient().get(`/api/apps/${appId}`, config);
  return data.data;
};

/**
 * Get app overview with statistics and chart data
 * Includes x-account-id header if provided, or x-organization-id for invited members
 */
export const getAppOverviewService = async (
  appId: string,
  accountId?: string,
  orgId?: string,
) => {
  const config: any = {};
  if (accountId) {
    config.headers = { "x-account-id": accountId };
  } else if (orgId) {
    config.headers = { "x-organization-id": orgId };
  }
  const { data } = await getApiClient().get(
    `/api/apps/${appId}/overview`,
    config,
  );
  return data.data as AppOverview;
};

/**
 * Update app
 */
export const updateAppService = async (
  appId: string,
  payload: Partial<CreateAppPayload>,
) => {
  const { data } = await getApiClient().put(`/api/apps/${appId}`, payload);
  return data.data;
};

/**
 * Delete app
 */
export const deleteAppService = async (appId: string) => {
  const { data } = await getApiClient().delete(`/api/apps/${appId}`);
  return data.data;
};

// ──────────────────────────────────────────
// APP TEMPLATE ENDPOINTS
// ──────────────────────────────────────────

/**
 * Create app template
 * POST /api/apps/:appId/templates
 */
export const createAppTemplateService = async (
  appId: string,
  payload: CreateAppTemplatePayload,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const { data } = await getApiClient().post(
    `/api/apps/${appId}/templates`,
    payload,
    config,
  );
  return data.data;
};

/**
 * Get all app templates
 * GET /api/apps/:appId/templates
 */
export const getAppTemplatesService = async (
  appId: string,
  accountId?: string,
  orgId?: string,
) => {
  const config: any = {};
  if (accountId) {
    config.headers = { "x-account-id": accountId };
  } else if (orgId) {
    config.headers = { "x-organization-id": orgId };
  }
  const { data } = await getApiClient().get<any>(
    `/api/apps/${appId}/templates`,
    config,
  );
  return data.data as AppTemplatesResponse;
};

/**
 * Get app template by ID
 * GET /api/apps/:appId/templates/:templateId
 */
export const getAppTemplateService = async (
  appId: string,
  templateId: string,
  accountId?: string,
  orgId?: string,
) => {
  const config: any = {};
  if (accountId) {
    config.headers = { "x-account-id": accountId };
  } else if (orgId) {
    config.headers = { "x-organization-id": orgId };
  }
  const { data } = await getApiClient().get<any>(
    `/api/apps/${appId}/templates/${templateId}`,
    config,
  );
  return data.data as AppTemplateResponse;
};

/**
 * Update app template
 * PUT /api/apps/:appId/templates/:templateId
 */
export const updateAppTemplateService = async (
  appId: string,
  templateId: string,
  payload: Partial<CreateAppTemplatePayload>,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const { data } = await getApiClient().put<any>(
    `/api/apps/${appId}/templates/${templateId}`,
    payload,
    config,
  );
  return data.data as AppTemplateResponse;
};

/**
 * Delete app template
 * DELETE /api/apps/:appId/templates/:templateId
 */
export const deleteAppTemplateService = async (
  appId: string,
  templateId: string,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const { data } = await getApiClient().delete<any>(
    `/api/apps/${appId}/templates/${templateId}`,
    config,
  );
  return data.data;
};

// ──────────────────────────────────────────
// APP NOTIFICATIONS LOGS
// ──────────────────────────────────────────

export interface NotificationProviderLog {
  id: string;
  provider: string;
  status: "SENT" | "FAILED" | "PENDING" | "BOUNCED";
  channel?: string;
  response?: Record<string, any> | string | null;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  appId: string;
  accountId?: string;
  recipient: string;
  channel: "EMAIL" | "SMS" | "PUSH" | "IN_APP" | "WHATSAPP";
  status: "SENT" | "FAILED" | "PENDING" | "BOUNCED" | "QUEUED";
  deliveryState?:
    | "SENT"
    | "DELIVERED"
    | "FAILED"
    | "PENDING"
    | "BOUNCED"
    | "QUEUED";
  source?: string;
  provider?: string;
  templateCode?: string;
  templateId?: string;
  retryCount?: number;
  createdAt?: string;
  sentAt?: string;
  logs?: NotificationProviderLog[];
}

export interface AppNotificationsSummary {
  totalCount: number;
  deliveredCount: number;
  failedCount: number;
  pendingCount: number;
  bouncedCount: number;
  deliveryRate: number;
  failureRate: number;
}

export interface AppNotificationsResponse {
  appId: string;
  notifications: AppNotification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary?: AppNotificationsSummary;
}

/**
 * Get app notification logs
 * GET /api/apps/:appId/notifications
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
  accountId?: string,
  orgId?: string,
) => {
  const config: any = {};
  if (accountId) {
    config.headers = { "x-account-id": accountId };
  } else if (orgId) {
    config.headers = { "x-organization-id": orgId };
  }
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
    `/api/apps/${appId}/notifications${query}`,
    config,
  );
  return data.data as AppNotificationsResponse;
};

// ──────────────────────────────────────────
// API KEYS ENDPOINTS
// ──────────────────────────────────────────

export interface CreateApiKeyPayload {
  name: string;
  type?: "test" | "production";
}

export interface ApiKey {
  id: string;
  plainKey?: string; // Only returned on creation
  name: string;
  type: "test" | "production";
  createdAt: string;
  maskedKey?: string; // Partially masked key for display
}

export interface ApiKeysResponse {
  appId: string;
  apiKeys: ApiKey[];
  total: number;
}

export interface CreateApiKeyResponse {
  id: string;
  plainKey: string;
  name: string;
  type: "test" | "production";
  createdAt: string;
  message: string;
}

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
