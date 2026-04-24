import getApiClient from "./apiClient";

// ──────────────────────────────────────────
// NOTIFICATION LOG DATA TYPES
// ──────────────────────────────────────────

export interface NotificationLog {
  id: string;
  appId: string;
  recipient: string;
  recipientType: "email" | "phone" | "user";
  templateId: string;
  templateName: string;
  templateCode: string;
  channel: "email" | "sms" | "push" | "in_app" | "whatsapp";
  status: "delivered" | "failed" | "pending" | "bounced" | "queued";
  provider: string;
  providerMessageId?: string;
  sentAt: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  bounceType?: "hard" | "soft" | "complaint";
  errorMessage?: string;
  errorCode?: string;
  campaignId?: string;
  attemptCount: number;
  lastRetryAt?: string;
  metadata?: Record<string, any>;
  events?: Array<{
    type: string;
    timestamp: string;
    details?: string;
  }>;
}

export interface NotificationLogSummary {
  totalCount: number;
  deliveredCount: number;
  failedCount: number;
  pendingCount: number;
  bouncedCount: number;
  deliveryRate: number;
  failureRate: number;
  avgDeliveryTime?: number;
}

export interface ListNotificationLogsParams {
  page?: number;
  limit?: number;
  status?: "delivered" | "failed" | "pending" | "bounced" | "queued";
  channel?: "email" | "sms" | "push" | "in_app" | "whatsapp";
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  campaignId?: string;
  templateId?: string;
  provider?: string;
}

export interface ListNotificationLogsResponse {
  appId: string;
  notifications: NotificationLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: NotificationLogSummary;
}

export interface ExportLogsParams {
  format?: "csv" | "json";
  status?: "delivered" | "failed" | "pending" | "bounced" | "queued";
  channel?: "email" | "sms" | "push" | "in_app" | "whatsapp";
  dateFrom?: string;
  dateTo?: string;
  campaignId?: string;
  templateId?: string;
  fields?: string | string[];
}

// ──────────────────────────────────────────
// LIST NOTIFICATION LOGS
// ──────────────────────────────────────────

export const listNotificationLogsService = async (
  appId: string,
  params?: ListNotificationLogsParams,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.status) queryParams.append("status", params.status);
  if (params?.channel) queryParams.append("channel", params.channel);
  if (params?.search) queryParams.append("search", params.search);
  if (params?.dateFrom) queryParams.append("dateFrom", params.dateFrom);
  if (params?.dateTo) queryParams.append("dateTo", params.dateTo);
  if (params?.campaignId) queryParams.append("campaignId", params.campaignId);
  if (params?.templateId) queryParams.append("templateId", params.templateId);
  if (params?.provider) queryParams.append("provider", params.provider);

  const query = queryParams.toString() ? `?${queryParams.toString()}` : "";

  const { data } = await getApiClient().get<any>(
    `/api/apps/${appId}/notifications${query}`,
    config,
  );
  return data.data as ListNotificationLogsResponse;
};

// ──────────────────────────────────────────
// GET SINGLE NOTIFICATION LOG
// ──────────────────────────────────────────

export const getNotificationLogService = async (
  appId: string,
  notificationId: string,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const { data } = await getApiClient().get<any>(
    `/api/apps/${appId}/notifications/${notificationId}`,
    config,
  );
  return data.data as NotificationLog;
};

// ──────────────────────────────────────────
// GET NOTIFICATION STATUS (GENERAL)
// ──────────────────────────────────────────

export const getNotificationStatusService = async (
  notificationId: string,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const { data } = await getApiClient().get<any>(
    `/notify/${notificationId}`,
    config,
  );
  return data.data as Partial<NotificationLog>;
};

// ──────────────────────────────────────────
// EXPORT NOTIFICATION LOGS
// ──────────────────────────────────────────

export const exportNotificationLogsService = async (
  appId: string,
  params?: ExportLogsParams,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const queryParams = new URLSearchParams();

  if (params?.format) queryParams.append("format", params.format);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.channel) queryParams.append("channel", params.channel);
  if (params?.dateFrom) queryParams.append("dateFrom", params.dateFrom);
  if (params?.dateTo) queryParams.append("dateTo", params.dateTo);
  if (params?.campaignId) queryParams.append("campaignId", params.campaignId);
  if (params?.templateId) queryParams.append("templateId", params.templateId);
  if (params?.fields) {
    const fieldsStr = Array.isArray(params.fields)
      ? params.fields.join(",")
      : params.fields;
    queryParams.append("fields", fieldsStr);
  }

  const query = queryParams.toString() ? `?${queryParams.toString()}` : "";

  const response = await getApiClient().get(
    `/api/apps/${appId}/notifications/export${query}`,
    {
      ...config,
      responseType: "blob",
    },
  );

  return response.data;
};

// ──────────────────────────────────────────
// LIST GENERAL NOTIFICATION LOGS
// ──────────────────────────────────────────

export const listGeneralNotificationLogsService = async (
  params?: ListNotificationLogsParams,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.status) queryParams.append("status", params.status);
  if (params?.channel) queryParams.append("channel", params.channel);
  if (params?.dateFrom) queryParams.append("dateFrom", params.dateFrom);
  if (params?.dateTo) queryParams.append("dateTo", params.dateTo);
  if (params?.search) queryParams.append("search", params.search);

  const query = queryParams.toString() ? `?${queryParams.toString()}` : "";

  const { data } = await getApiClient().get<any>(
    `/notify/logs${query}`,
    config,
  );
  return data.data;
};
