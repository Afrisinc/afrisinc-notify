import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listOrgDomainsService,
  addOrgDomainService,
  getOrgDomainRecordsService,
  verifyOrgDomainService,
  deleteOrgDomainService,
  getOrgInboundMxRecordService,
  enableOrgInboundDomainService,
  addOrgSenderService,
  updateOrgSenderService,
  deleteOrgSenderService,
  listMySendersService,
  getOrgCloudflareSettingsService,
  updateOrgCloudflareSettingsService,
  deleteOrgCloudflareSettingsService,
} from "@/services/orgDomains";

export function useOrgDomains(orgId: string | undefined) {
  return useQuery({
    queryKey: ["orgDomains", orgId],
    queryFn: () => listOrgDomainsService(orgId!),
    enabled: !!orgId,
  });
}

export function useAddOrgDomain(orgId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      domain: string;
      selector?: string;
      cloudflareApiToken?: string;
    }) => addOrgDomainService(orgId!, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["orgDomains", orgId] }),
  });
}

export function useOrgDomainRecords(
  orgId: string | undefined,
  domainId: string | null,
) {
  return useQuery({
    queryKey: ["orgDomainRecords", orgId, domainId],
    queryFn: () => getOrgDomainRecordsService(orgId!, domainId!),
    enabled: !!orgId && !!domainId,
  });
}

export function useVerifyOrgDomain(orgId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (domainId: string) => verifyOrgDomainService(orgId!, domainId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["orgDomains", orgId] }),
  });
}

export function useDeleteOrgDomain(orgId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (domainId: string) => deleteOrgDomainService(orgId!, domainId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["orgDomains", orgId] }),
  });
}

export function useOrgInboundMxRecord(
  orgId: string | undefined,
  domainId: string | null,
) {
  return useQuery({
    queryKey: ["orgInboundMxRecord", orgId, domainId],
    queryFn: () => getOrgInboundMxRecordService(orgId!, domainId!),
    enabled: !!orgId && !!domainId,
  });
}

export function useEnableOrgInboundDomain(orgId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (domainId: string) =>
      enableOrgInboundDomainService(orgId!, domainId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["orgDomains", orgId] }),
  });
}

export function useAddOrgSender(orgId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      domainId,
      payload,
    }: {
      domainId: string;
      payload: {
        localPart: string;
        fromName?: string;
        replyToEmail?: string;
        replyToName?: string;
        assignedUserId?: string;
      };
    }) => addOrgSenderService(orgId!, domainId, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["orgDomains", orgId] }),
  });
}

export function useUpdateOrgSender(orgId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      senderId,
      payload,
    }: {
      senderId: string;
      payload: {
        fromName?: string;
        replyToEmail?: string;
        replyToName?: string;
        assignedUserId?: string | null;
      };
    }) => updateOrgSenderService(orgId!, senderId, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["orgDomains", orgId] }),
  });
}

export function useDeleteOrgSender(orgId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (senderId: string) => deleteOrgSenderService(orgId!, senderId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["orgDomains", orgId] }),
  });
}

export function useMySenders(orgId: string | undefined) {
  return useQuery({
    queryKey: ["mySenders", orgId],
    queryFn: () => listMySendersService(orgId!),
    enabled: !!orgId,
  });
}

// ──────────────────────────────────────────
// ORGANIZATION-LEVEL CLOUDFLARE DEFAULT
// ──────────────────────────────────────────

export function useOrgCloudflareSettings(orgId: string | undefined) {
  return useQuery({
    queryKey: ["orgCloudflareSettings", orgId],
    queryFn: () => getOrgCloudflareSettingsService(orgId!),
    enabled: !!orgId,
  });
}

export function useUpdateOrgCloudflareSettings(orgId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cloudflareApiToken: string) =>
      updateOrgCloudflareSettingsService(orgId!, cloudflareApiToken),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["orgCloudflareSettings", orgId],
      }),
  });
}

export function useDeleteOrgCloudflareSettings(orgId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteOrgCloudflareSettingsService(orgId!),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["orgCloudflareSettings", orgId],
      }),
  });
}
