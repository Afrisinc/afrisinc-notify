import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAppSettingsService,
  updateAppSettingsService,
  updateAllowedDomainsService,
  listWebhooksService,
  createWebhookService,
  updateWebhookService,
  deleteWebhookService,
  testWebhookService,
  getWebhookLogsService,
  deleteAppService,
  getEmailConfigService,
  setEmailConfigService,
  resetEmailConfigService,
  verifyDNSService,
  createDomainService,
  getDomainRecordsService,
  verifyDomainService,
  getEmailProviderService,
  setSimpleEmailConfigService,
  getGmailOAuthUrlService,
  saveGmailOAuthCallbackService,
  setGmailAppPasswordService,
  resetEmailProviderService,
  type UpdateAppSettingsPayload,
  type UpdateAllowedDomainsPayload,
  type CreateWebhookPayload,
  type UpdateWebhookPayload,
  type SetEmailConfigPayload,
  type CreateDomainPayload,
} from "@/services/appSettings";
import { useCurrentAccountId } from "@/hooks/useAuth";

// ──────────────────────────────────────────
// GET APP SETTINGS
// ──────────────────────────────────────────

export function useAppSettings(appId: string, options?: { enabled?: boolean }) {
  const accountId = useCurrentAccountId();

  return useQuery({
    queryKey: ["appSettings", appId, accountId],
    queryFn: () => getAppSettingsService(appId, accountId ?? undefined),
    enabled: (options?.enabled ?? true) && !!appId && !!accountId,
  });
}

// ──────────────────────────────────────────
// UPDATE APP SETTINGS
// ──────────────────────────────────────────

export function useUpdateAppSettings() {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appId, payload }: { appId: string; payload: UpdateAppSettingsPayload }) =>
      updateAppSettingsService(appId, payload, accountId ?? undefined),
    onSuccess: (_data, { appId }) => {
      queryClient.invalidateQueries({
        queryKey: ["appSettings", appId],
      });
    },
  });
}

// ──────────────────────────────────────────
// UPDATE ALLOWED DOMAINS
// ──────────────────────────────────────────

export function useUpdateAllowedDomains() {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appId,
      payload,
    }: {
      appId: string;
      payload: UpdateAllowedDomainsPayload;
    }) => updateAllowedDomainsService(appId, payload, accountId ?? undefined),
    onSuccess: (_data, { appId }) => {
      queryClient.invalidateQueries({
        queryKey: ["appSettings", appId],
      });
    },
  });
}

// ──────────────────────────────────────────
// LIST WEBHOOKS
// ──────────────────────────────────────────

export function useWebhooks(appId: string, options?: { enabled?: boolean }) {
  const accountId = useCurrentAccountId();

  return useQuery({
    queryKey: ["webhooks", appId, accountId],
    queryFn: () => listWebhooksService(appId, accountId ?? undefined),
    enabled: (options?.enabled ?? true) && !!appId && !!accountId,
  });
}

// ──────────────────────────────────────────
// CREATE WEBHOOK
// ──────────────────────────────────────────

export function useCreateWebhook() {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appId, payload }: { appId: string; payload: CreateWebhookPayload }) =>
      createWebhookService(appId, payload, accountId ?? undefined),
    onSuccess: (_data, { appId }) => {
      queryClient.invalidateQueries({
        queryKey: ["webhooks", appId],
      });
    },
  });
}

// ──────────────────────────────────────────
// UPDATE WEBHOOK
// ──────────────────────────────────────────

export function useUpdateWebhook() {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appId,
      webhookId,
      payload,
    }: {
      appId: string;
      webhookId: string;
      payload: UpdateWebhookPayload;
    }) => updateWebhookService(appId, webhookId, payload, accountId ?? undefined),
    onSuccess: (_data, { appId }) => {
      queryClient.invalidateQueries({
        queryKey: ["webhooks", appId],
      });
    },
  });
}

// ──────────────────────────────────────────
// DELETE WEBHOOK
// ──────────────────────────────────────────

export function useDeleteWebhook() {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appId, webhookId }: { appId: string; webhookId: string }) =>
      deleteWebhookService(appId, webhookId, accountId ?? undefined),
    onSuccess: (_data, { appId }) => {
      queryClient.invalidateQueries({
        queryKey: ["webhooks", appId],
      });
    },
  });
}

// ──────────────────────────────────────────
// TEST WEBHOOK
// ──────────────────────────────────────────

export function useTestWebhook() {
  const accountId = useCurrentAccountId();

  return useMutation({
    mutationFn: ({
      appId,
      webhookId,
      event,
    }: {
      appId: string;
      webhookId: string;
      event: string;
    }) => testWebhookService(appId, webhookId, event, accountId ?? undefined),
  });
}

// ──────────────────────────────────────────
// GET WEBHOOK LOGS
// ──────────────────────────────────────────

export function useWebhookLogs(
  appId: string,
  webhookId: string,
  params?: {
    page?: number;
    limit?: number;
    status?: "success" | "failed" | "pending";
  },
  options?: { enabled?: boolean }
) {
  const accountId = useCurrentAccountId();

  return useQuery({
    queryKey: ["webhookLogs", appId, webhookId, accountId, params],
    queryFn: () =>
      getWebhookLogsService(appId, webhookId, params, accountId ?? undefined),
    enabled: (options?.enabled ?? true) && !!appId && !!webhookId && !!accountId,
  });
}

// ──────────────────────────────────────────
// DELETE APP
// ──────────────────────────────────────────

export function useDeleteApp() {
  const accountId = useCurrentAccountId();

  return useMutation({
    mutationFn: (appId: string) => deleteAppService(appId, accountId ?? undefined),
  });
}

// ──────────────────────────────────────────
// EMAIL CONFIGURATION
// ──────────────────────────────────────────

export function useEmailConfig(appId: string) {
  const accountId = useCurrentAccountId();

  return useQuery({
    queryKey: ["emailConfig", appId, accountId],
    queryFn: () => getEmailConfigService(appId, accountId ?? undefined),
    enabled: !!appId && !!accountId,
    staleTime: 60_000,
  });
}

export function useSetEmailConfig() {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appId, payload }: { appId: string; payload: SetEmailConfigPayload }) =>
      setEmailConfigService(appId, payload, accountId ?? undefined),
    onSuccess: (_data, { appId }) => {
      queryClient.invalidateQueries({
        queryKey: ["emailConfig", appId],
      });
    },
  });
}

export function useResetEmailConfig() {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appId }: { appId: string }) =>
      resetEmailConfigService(appId, accountId ?? undefined),
    onSuccess: (_data, { appId }) => {
      queryClient.invalidateQueries({
        queryKey: ["emailConfig", appId],
      });
    },
  });
}

export function useVerifyDNS() {
  const accountId = useCurrentAccountId();

  return useMutation({
    mutationFn: ({ appId, email }: { appId: string; email: string }) =>
      verifyDNSService(appId, email, accountId ?? undefined),
  });
}

// ──────────────────────────────────────────
// CUSTOM DOMAINS (notification-service)
// ──────────────────────────────────────────

export function useCreateDomain() {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appId, payload }: { appId: string; payload: CreateDomainPayload }) =>
      createDomainService(appId, payload, accountId ?? undefined),
    onSuccess: (_data, { appId }) => {
      queryClient.invalidateQueries({
        queryKey: ["domains", appId],
      });
    },
  });
}

export function useGetDomainRecords(appId: string) {
  const accountId = useCurrentAccountId();

  return useQuery({
    queryKey: ["domainRecords", appId, accountId],
    queryFn: () => getDomainRecordsService(appId, accountId ?? undefined),
    enabled: !!appId && !!accountId,
    staleTime: 30_000,
  });
}

export function useVerifyDomain() {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appId }: { appId: string }) =>
      verifyDomainService(appId, accountId ?? undefined),
    onSuccess: (_data, { appId }) => {
      queryClient.invalidateQueries({
        queryKey: ["domainRecords", appId],
      });
    },
  });
}

// ──────────────────────────────────────────
// EMAIL PROVIDER (Unified: Simple, Gmail, Custom Domain)
// ──────────────────────────────────────────

export function useEmailProvider(appId: string) {
  const accountId = useCurrentAccountId();

  return useQuery({
    queryKey: ["emailProvider", appId, accountId],
    queryFn: () => getEmailProviderService(appId, accountId ?? undefined),
    enabled: !!appId && !!accountId,
    staleTime: 60_000,
  });
}

export function useSetSimpleEmailConfig() {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appId,
      payload,
    }: {
      appId: string;
      payload: Parameters<typeof setSimpleEmailConfigService>[1];
    }) => setSimpleEmailConfigService(appId, payload, accountId ?? undefined),
    onSuccess: (_data, { appId }) => {
      queryClient.invalidateQueries({
        queryKey: ["emailProvider", appId],
      });
    },
  });
}

export function useGmailOAuthUrl() {
  const accountId = useCurrentAccountId();

  return useMutation({
    mutationFn: ({ appId }: { appId: string }) =>
      getGmailOAuthUrlService(appId, accountId ?? undefined),
  });
}

export function useSaveGmailOAuthCallback() {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appId,
      payload,
    }: {
      appId: string;
      payload: Parameters<typeof saveGmailOAuthCallbackService>[1];
    }) => saveGmailOAuthCallbackService(appId, payload, accountId ?? undefined),
    onSuccess: (_data, { appId }) => {
      queryClient.invalidateQueries({
        queryKey: ["emailProvider", appId],
      });
    },
  });
}

export function useSetGmailAppPassword() {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appId,
      payload,
    }: {
      appId: string;
      payload: Parameters<typeof setGmailAppPasswordService>[1];
    }) => setGmailAppPasswordService(appId, payload, accountId ?? undefined),
    onSuccess: (_data, { appId }) => {
      queryClient.invalidateQueries({
        queryKey: ["emailProvider", appId],
      });
    },
  });
}

export function useResetEmailProvider() {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appId }: { appId: string }) =>
      resetEmailProviderService(appId, accountId ?? undefined),
    onSuccess: (_data, { appId }) => {
      queryClient.invalidateQueries({
        queryKey: ["emailProvider", appId],
      });
    },
  });
}
