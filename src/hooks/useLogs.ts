import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listNotificationLogsService,
  getNotificationLogService,
  getNotificationStatusService,
  exportNotificationLogsService,
  listGeneralNotificationLogsService,
  type ListNotificationLogsParams,
  type ExportLogsParams,
} from "@/services/logs";
import { useCurrentAccountId } from "@/hooks/useAuth";

// ──────────────────────────────────────────
// LIST NOTIFICATION LOGS (APP-SCOPED)
// ──────────────────────────────────────────

export function useNotificationLogs(
  appId: string,
  params?: ListNotificationLogsParams,
  options?: { enabled?: boolean },
) {
  const accountId = useCurrentAccountId();

  return useQuery({
    queryKey: ["notificationLogs", appId, accountId, params],
    queryFn: () =>
      listNotificationLogsService(appId, params, accountId ?? undefined),
    enabled: (options?.enabled ?? true) && !!appId && !!accountId,
  });
}

// ──────────────────────────────────────────
// GET SINGLE NOTIFICATION LOG
// ──────────────────────────────────────────

export function useNotificationLog(
  appId: string,
  notificationId: string,
  options?: { enabled?: boolean },
) {
  const accountId = useCurrentAccountId();

  return useQuery({
    queryKey: ["notificationLog", appId, notificationId, accountId],
    queryFn: () =>
      getNotificationLogService(appId, notificationId, accountId ?? undefined),
    enabled:
      (options?.enabled ?? true) && !!appId && !!notificationId && !!accountId,
  });
}

// ──────────────────────────────────────────
// GET NOTIFICATION STATUS (GENERAL)
// ──────────────────────────────────────────

export function useNotificationStatus(
  notificationId: string,
  options?: { enabled?: boolean },
) {
  const accountId = useCurrentAccountId();

  return useQuery({
    queryKey: ["notificationStatus", notificationId, accountId],
    queryFn: () =>
      getNotificationStatusService(notificationId, accountId ?? undefined),
    enabled: (options?.enabled ?? true) && !!notificationId,
  });
}

// ──────────────────────────────────────────
// EXPORT NOTIFICATION LOGS
// ──────────────────────────────────────────

export function useExportNotificationLogs() {
  const accountId = useCurrentAccountId();

  return useMutation({
    mutationFn: ({
      appId,
      params,
    }: {
      appId: string;
      params?: ExportLogsParams;
    }) => exportNotificationLogsService(appId, params, accountId ?? undefined),
  });
}

// ──────────────────────────────────────────
// LIST GENERAL NOTIFICATION LOGS
// ──────────────────────────────────────────

export function useGeneralNotificationLogs(
  params?: ListNotificationLogsParams,
  options?: { enabled?: boolean },
) {
  const accountId = useCurrentAccountId();

  return useQuery({
    queryKey: ["generalNotificationLogs", accountId, params],
    queryFn: () =>
      listGeneralNotificationLogsService(params, accountId ?? undefined),
    enabled: (options?.enabled ?? true) && !!accountId,
  });
}

// ──────────────────────────────────────────
// POLLING HOOK FOR REAL-TIME STATUS
// ──────────────────────────────────────────

export function useNotificationStatusPoling(
  appId: string,
  notificationId: string,
  pollInterval?: number,
  options?: { enabled?: boolean },
) {
  const accountId = useCurrentAccountId();

  return useQuery({
    queryKey: ["notificationLogPolling", appId, notificationId, accountId],
    queryFn: () =>
      getNotificationLogService(appId, notificationId, accountId ?? undefined),
    enabled:
      (options?.enabled ?? true) && !!appId && !!notificationId && !!accountId,
    refetchInterval: pollInterval || 5000, // Poll every 5 seconds by default
    refetchOnWindowFocus: false,
  });
}
