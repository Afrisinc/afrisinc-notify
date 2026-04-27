import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  sendNotificationService,
  sendBulkNotificationsService,
  getNotificationStatusService,
  getNotificationHistoryService,
  type SendNotificationPayload,
} from "@/services/notificationService";
import { useCurrentAccountId } from "@/hooks/useAuth";

/**
 * Send a single notification
 * Automatically includes x-account-id header from current organization
 */
export function useSendNotification() {
  const accountId = useCurrentAccountId();

  return useMutation({
    mutationFn: (payload: SendNotificationPayload) =>
      sendNotificationService(payload, accountId ?? undefined),
  });
}

/**
 * Send bulk notifications to multiple recipients
 * Automatically includes x-account-id header from current organization
 */
export function useSendBulkNotifications() {
  const accountId = useCurrentAccountId();

  return useMutation({
    mutationFn: ({
      channel,
      templateId,
      recipients,
      payload,
    }: {
      channel: string;
      templateId: string;
      recipients: string[];
      payload?: Record<string, any>;
    }) =>
      sendBulkNotificationsService(
        channel,
        templateId,
        recipients,
        payload,
        accountId ?? undefined,
      ),
  });
}

/**
 * Get notification status
 * Automatically includes x-account-id header from current organization
 */
export function useNotificationStatus(
  notificationId: string,
  options?: { enabled?: boolean },
) {
  const accountId = useCurrentAccountId();

  return useQuery({
    queryKey: ["notificationStatus", notificationId, accountId],
    queryFn: () =>
      getNotificationStatusService(notificationId, accountId ?? undefined),
    enabled: (options?.enabled ?? true) && !!notificationId && !!accountId,
  });
}

/**
 * Get notification history for a recipient
 * Automatically includes x-account-id header from current organization
 */
export function useNotificationHistory(
  recipient: string,
  options?: {
    channel?: string;
    limit?: number;
    offset?: number;
    enabled?: boolean;
  },
) {
  const accountId = useCurrentAccountId();

  return useQuery({
    queryKey: [
      "notificationHistory",
      recipient,
      options?.channel,
      options?.limit,
      options?.offset,
      accountId,
    ],
    queryFn: () =>
      getNotificationHistoryService(
        recipient,
        options?.channel,
        options?.limit,
        options?.offset,
        accountId ?? undefined,
      ),
    enabled: (options?.enabled ?? true) && !!recipient && !!accountId,
  });
}

/**
 * Hook to poll notification status
 * Useful for real-time status updates
 */
export function useNotificationStatusPolling(
  notificationId: string,
  pollInterval: number = 2000,
  options?: { enabled?: boolean; maxAttempts?: number },
) {
  const accountId = useCurrentAccountId();
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = options?.maxAttempts ?? 30; // Stop after 1 minute by default

  return useQuery({
    queryKey: ["notificationStatusPoll", notificationId, accountId],
    queryFn: () => {
      setAttempts((prev) => prev + 1);
      return getNotificationStatusService(
        notificationId,
        accountId ?? undefined,
      );
    },
    refetchInterval: (data) => {
      // Stop polling if status is final (sent, failed, etc.) or max attempts reached
      if (
        data?.status === "sent" ||
        data?.status === "failed" ||
        attempts >= maxAttempts
      ) {
        return false;
      }
      return pollInterval;
    },
    enabled: (options?.enabled ?? true) && !!notificationId && !!accountId,
  });
}
