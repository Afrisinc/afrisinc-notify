import getApiClient from "./apiClient";

// ──────────────────────────────────────────
// CAMPAIGN DATA TYPES
// ──────────────────────────────────────────

export interface Campaign {
  id: string;
  appId: string;
  name: string;
  channel: "email" | "sms" | "push" | "in_app";
  // Template mode
  templateId?: string;
  // EMAIL direct content
  subject?: string;
  htmlContent?: string;
  // SMS direct content
  textContent?: string;
  // PUSH direct content
  pushTitle?: string;
  pushBody?: string;
  pushImageUrl?: string;
  pushActionUrl?: string;
  pushData?: Record<string, any>;
  // IN_APP direct content
  inappTitle?: string;
  inappBody?: string;
  inappImageUrl?: string;
  inappActionUrl?: string;
  inappActionText?: string;
  // Recipient targeting
  recipientType: "all" | "tags" | "segment" | "custom";
  recipientCount: number;
  recipientTags?: string[];
  recipientSegment?: string;
  status:
    | "draft"
    | "scheduled"
    | "sending"
    | "completed"
    | "failed"
    | "cancelled";
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  scheduledAt?: string;
  sentAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignPayload {
  name: string;
  channel: "EMAIL" | "SMS" | "PUSH" | "IN_APP";
  // Content mode: templateId OR direct channel content
  templateId?: string;
  // EMAIL direct content
  subject?: string;
  html_content?: string;
  // SMS direct content
  text_content?: string;
  // PUSH direct content
  push_title?: string;
  push_body?: string;
  push_image_url?: string;
  push_action_url?: string;
  push_data?: Record<string, any>;
  // IN_APP direct content
  inapp_title?: string;
  inapp_body?: string;
  inapp_image_url?: string;
  inapp_action_url?: string;
  inapp_action_text?: string;
  // Recipient targeting
  recipientType?: "all" | "tags" | "segment" | "custom";
  recipientCount?: number;
  recipientTags?: string[];
  recipientSegment?: string;
  status?: "draft" | "scheduled" | "completed";
  scheduledAt?: string;
  metadata?: Record<string, any>;
}

export interface ListCampaignsParams {
  page?: number;
  limit?: number;
  status?: "draft" | "scheduled" | "completed" | "cancelled";
  channel?: "email" | "sms" | "push" | "in_app";
  sortBy?: "name" | "createdAt" | "status" | "sentCount";
  sortOrder?: "asc" | "desc";
}

export interface ListCampaignsResponse {
  appId: string;
  campaigns: Campaign[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SendCampaignPayload {
  dryRun?: boolean;
}

export interface SendCampaignResponse {
  campaignId: string;
  status: string;
  sentCount: number;
  failedCount: number;
  sentAt: string;
  estimatedDeliveryTime: string;
}

export interface ScheduleCampaignPayload {
  scheduledAt: string;
}

export interface DuplicateCampaignPayload {
  newName: string;
}

export interface CampaignStats {
  campaignId: string;
  name: string;
  status: string;
  sentAt?: string;
  stats: {
    totalRecipients: number;
    sentCount: number;
    deliveredCount: number;
    failedCount: number;
    bounceCount: number;
    openCount: number;
    clickCount: number;
    conversionCount: number;
    unsubscribeCount: number;
  };
  rates: {
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
  };
  timeline: {
    createdAt: string;
    sentAt?: string;
    completedAt?: string;
  };
}

export interface CampaignsSummaryStats {
  appId: string;
  period: {
    from: string;
    to: string;
  };
  summary: {
    totalCampaigns: number;
    draftCount: number;
    scheduledCount: number;
    completedCount: number;
    cancelledCount: number;
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    averageDeliveryRate: number;
  };
  byChannel: Record<
    string,
    {
      count: number;
      sent: number;
      delivered: number;
      failed: number;
      deliveryRate: number;
    }
  >;
  topCampaigns: Array<{
    id: string;
    name: string;
    channel: string;
    sentCount: number;
    deliveredCount: number;
    openCount?: number;
    openRate?: number;
  }>;
}

export interface CampaignsSummaryParams {
  status?: "draft" | "scheduled" | "completed" | "cancelled";
  channel?: "email" | "sms" | "push" | "in_app";
  dateFrom?: string;
  dateTo?: string;
}

// ──────────────────────────────────────────
// LIST CAMPAIGNS
// ──────────────────────────────────────────

export const listCampaignsService = async (
  appId: string,
  params?: ListCampaignsParams,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.status) queryParams.append("status", params.status);
  if (params?.channel) queryParams.append("channel", params.channel);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const query = queryParams.toString() ? `?${queryParams.toString()}` : "";

  const { data } = await getApiClient().get<any>(
    `/api/apps/${appId}/campaigns${query}`,
    config,
  );
  return data.data as ListCampaignsResponse;
};

// ──────────────────────────────────────────
// CREATE CAMPAIGN
// ──────────────────────────────────────────

export const createCampaignService = async (
  appId: string,
  payload: CreateCampaignPayload,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const { data } = await getApiClient().post<any>(
    `/api/apps/${appId}/campaigns`,
    payload,
    config,
  );
  return data.data as Campaign;
};

// ──────────────────────────────────────────
// GET SINGLE CAMPAIGN
// ──────────────────────────────────────────

export const getCampaignService = async (
  appId: string,
  campaignId: string,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const { data } = await getApiClient().get<any>(
    `/api/apps/${appId}/campaigns/${campaignId}`,
    config,
  );
  return data.data as Campaign;
};

// ──────────────────────────────────────────
// UPDATE CAMPAIGN
// ──────────────────────────────────────────

export const updateCampaignService = async (
  appId: string,
  campaignId: string,
  payload: Partial<CreateCampaignPayload>,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const { data } = await getApiClient().put<any>(
    `/api/apps/${appId}/campaigns/${campaignId}`,
    payload,
    config,
  );
  return data.data as Campaign;
};

// ──────────────────────────────────────────
// DELETE CAMPAIGN
// ──────────────────────────────────────────

export const deleteCampaignService = async (
  appId: string,
  campaignId: string,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const { data } = await getApiClient().delete<any>(
    `/api/apps/${appId}/campaigns/${campaignId}`,
    config,
  );
  return data.data;
};

// ──────────────────────────────────────────
// SEND CAMPAIGN
// ──────────────────────────────────────────

export const sendCampaignService = async (
  appId: string,
  campaignId: string,
  payload?: SendCampaignPayload,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const { data } = await getApiClient().post<any>(
    `/api/apps/${appId}/campaigns/${campaignId}/send`,
    payload || {},
    config,
  );
  return data.data as SendCampaignResponse;
};

// ──────────────────────────────────────────
// SCHEDULE CAMPAIGN
// ──────────────────────────────────────────

export const scheduleCampaignService = async (
  appId: string,
  campaignId: string,
  payload: ScheduleCampaignPayload,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const { data } = await getApiClient().post<any>(
    `/api/apps/${appId}/campaigns/${campaignId}/schedule`,
    payload,
    config,
  );
  return data.data as Campaign;
};

// ──────────────────────────────────────────
// DUPLICATE CAMPAIGN
// ──────────────────────────────────────────

export const duplicateCampaignService = async (
  appId: string,
  campaignId: string,
  payload: DuplicateCampaignPayload,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const { data } = await getApiClient().post<any>(
    `/api/apps/${appId}/campaigns/${campaignId}/duplicate`,
    payload,
    config,
  );
  return data.data as Campaign;
};

// ──────────────────────────────────────────
// GET CAMPAIGN STATISTICS
// ──────────────────────────────────────────

export const getCampaignStatsService = async (
  appId: string,
  campaignId: string,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const { data } = await getApiClient().get<any>(
    `/api/apps/${appId}/campaigns/${campaignId}/stats`,
    config,
  );
  return data.data as CampaignStats;
};

// ──────────────────────────────────────────
// GET CAMPAIGNS SUMMARY STATISTICS
// ──────────────────────────────────────────

export const getCampaignsSummaryStatsService = async (
  appId: string,
  params?: CampaignsSummaryParams,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const queryParams = new URLSearchParams();

  if (params?.status) queryParams.append("status", params.status);
  if (params?.channel) queryParams.append("channel", params.channel);
  if (params?.dateFrom) queryParams.append("dateFrom", params.dateFrom);
  if (params?.dateTo) queryParams.append("dateTo", params.dateTo);

  const query = queryParams.toString() ? `?${queryParams.toString()}` : "";

  const { data } = await getApiClient().get<any>(
    `/api/apps/${appId}/campaigns/stats/summary${query}`,
    config,
  );
  return data.data as CampaignsSummaryStats;
};
