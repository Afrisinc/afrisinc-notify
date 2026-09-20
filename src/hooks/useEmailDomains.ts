import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listEmailDomainsService,
  addEmailDomainService,
  getEmailDomainRecordsService,
  verifyEmailDomainService,
  deleteEmailDomainService,
  getInboundMxRecordService,
  enableInboundDomainService,
} from "@/services/emailDomains";
import { useCurrentAccountId } from "@/hooks/useAuth";

export function useEmailDomains(appId: string) {
  const accountId = useCurrentAccountId();
  return useQuery({
    queryKey: ["emailDomains", appId, accountId],
    queryFn: () => listEmailDomainsService(appId, accountId ?? undefined),
    enabled: !!appId && !!accountId,
  });
}

export function useAddEmailDomain(appId: string) {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      domain: string;
      selector?: string;
      cloudflareApiToken?: string;
    }) => addEmailDomainService(appId, payload, accountId ?? undefined),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["emailDomains", appId] }),
  });
}

export function useEmailDomainRecords(appId: string, domainId: string | null) {
  const accountId = useCurrentAccountId();
  return useQuery({
    queryKey: ["emailDomainRecords", appId, domainId, accountId],
    queryFn: () =>
      getEmailDomainRecordsService(appId, domainId!, accountId ?? undefined),
    enabled: !!appId && !!domainId && !!accountId,
  });
}

export function useVerifyEmailDomain(appId: string) {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (domainId: string) =>
      verifyEmailDomainService(appId, domainId, accountId ?? undefined),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["emailDomains", appId] }),
  });
}

export function useDeleteEmailDomain(appId: string) {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (domainId: string) =>
      deleteEmailDomainService(appId, domainId, accountId ?? undefined),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["emailDomains", appId] }),
  });
}

export function useInboundMxRecord(appId: string, domainId: string | null) {
  const accountId = useCurrentAccountId();
  return useQuery({
    queryKey: ["inboundMxRecord", appId, domainId, accountId],
    queryFn: () =>
      getInboundMxRecordService(appId, domainId!, accountId ?? undefined),
    enabled: !!appId && !!domainId && !!accountId,
  });
}

export function useEnableInboundDomain(appId: string) {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (domainId: string) =>
      enableInboundDomainService(appId, domainId, accountId ?? undefined),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["emailDomains", appId] }),
  });
}
