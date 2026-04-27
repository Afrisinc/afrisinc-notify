import getApiClient from "./apiClient";

/**
 * Notification Send Payload
 */
export interface SendNotificationPayload {
  channel: "EMAIL" | "SMS" | "PUSH" | "IN_APP" | "WHATSAPP";
  recipient: string; // Email, phone number, user ID, etc. depending on channel
  templateId: string;
  appId: string; // Required: App ID to associate notification with the app
  payload?: Record<string, any>; // Variables to replace in template
  accountId?: string; // Optional: Account ID for multi-account scenarios
}

/**
 * Notification Send Response
 */
export interface SendNotificationResponse {
  success: boolean;
  resp_msg: string;
  resp_code: number;
  data: {
    notificationId: string;
    channel: string;
    recipient: string;
    templateId: string;
    status: "sent" | "pending" | "failed";
    sentAt: string;
    message?: string;
  };
}

/**
 * Send a notification using a template
 * POST /api/notify/send
 *
 * @param payload - Notification payload with channel, recipient, templateId, appId, and variables
 * @param accountId - Optional: Account ID header for multi-account scenarios
 * @returns Promise with notification response
 */
export const sendNotificationService = async (
  payload: SendNotificationPayload,
  accountId?: string,
): Promise<SendNotificationResponse["data"]> => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};

  const { data } = await getApiClient().post<SendNotificationResponse>(
    "/api/notify/send",
    {
      channel: payload.channel,
      recipient: payload.recipient,
      templateId: payload.templateId,
      app_id: payload.appId,
      payload: payload.payload || {},
    },
    config,
  );

  return data.data;
};

/**
 * Bulk send notifications to multiple recipients
 * POST /api/notify/send-bulk
 *
 * @param channel - Channel type (EMAIL, SMS, PUSH, etc.)
 * @param templateId - Template ID to use
 * @param recipients - Array of recipients (emails, phone numbers, etc.)
 * @param payload - Variables to replace in template
 * @param accountId - Optional: Account ID header
 * @returns Promise with bulk notification response
 */
export const sendBulkNotificationsService = async (
  channel: string,
  templateId: string,
  recipients: string[],
  payload?: Record<string, any>,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};

  const { data } = await getApiClient().post(
    "/api/notify/send-bulk",
    {
      channel,
      templateId,
      recipients,
      payload: payload || {},
    },
    config,
  );

  return data.data;
};

/**
 * Get notification status
 * GET /api/notify/:notificationId
 *
 * @param notificationId - Notification ID
 * @param accountId - Optional: Account ID header
 * @returns Promise with notification status
 */
export const getNotificationStatusService = async (
  notificationId: string,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};

  const { data } = await getApiClient().get(
    `/api/notify/${notificationId}`,
    config,
  );

  return data.data;
};

/**
 * Get notification history for a user
 * GET /api/notify/history?recipient=xxx&channel=EMAIL
 *
 * @param recipient - Recipient email/phone/ID
 * @param channel - Optional: Filter by channel
 * @param limit - Optional: Number of records (default 20)
 * @param offset - Optional: Pagination offset
 * @param accountId - Optional: Account ID header
 * @returns Promise with notification history
 */
export const getNotificationHistoryService = async (
  recipient: string,
  channel?: string,
  limit?: number,
  offset?: number,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const params = new URLSearchParams({
    recipient,
    ...(channel && { channel }),
    ...(limit && { limit: limit.toString() }),
    ...(offset && { offset: offset.toString() }),
  });

  const { data } = await getApiClient().get(
    `/api/notify/history?${params.toString()}`,
    config,
  );

  return data.data;
};
