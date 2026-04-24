import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listCampaignsService,
  createCampaignService,
  getCampaignService,
  updateCampaignService,
  deleteCampaignService,
  sendCampaignService,
  scheduleCampaignService,
  duplicateCampaignService,
  getCampaignStatsService,
  getCampaignsSummaryStatsService,
  type CreateCampaignPayload,
  type ListCampaignsParams,
  type SendCampaignPayload,
  type ScheduleCampaignPayload,
  type DuplicateCampaignPayload,
  type CampaignsSummaryParams,
} from "@/services/campaigns";
import { useCurrentAccountId } from "@/hooks/useAuth";

// ──────────────────────────────────────────
// LIST CAMPAIGNS
// ──────────────────────────────────────────

export function useCampaigns(
  appId: string,
  params?: ListCampaignsParams,
  options?: { enabled?: boolean },
) {
  const accountId = useCurrentAccountId();

  return useQuery({
    queryKey: ["campaigns", appId, accountId, params],
    queryFn: () => listCampaignsService(appId, params, accountId ?? undefined),
    enabled: (options?.enabled ?? true) && !!appId && !!accountId,
  });
}

// ──────────────────────────────────────────
// GET SINGLE CAMPAIGN
// ──────────────────────────────────────────

export function useCampaign(
  appId: string,
  campaignId: string,
  options?: { enabled?: boolean },
) {
  const accountId = useCurrentAccountId();

  return useQuery({
    queryKey: ["campaign", appId, campaignId, accountId],
    queryFn: () =>
      getCampaignService(appId, campaignId, accountId ?? undefined),
    enabled:
      (options?.enabled ?? true) && !!appId && !!campaignId && !!accountId,
  });
}

// ──────────────────────────────────────────
// CREATE CAMPAIGN
// ──────────────────────────────────────────

export function useCreateCampaign() {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appId,
      payload,
    }: {
      appId: string;
      payload: CreateCampaignPayload;
    }) => createCampaignService(appId, payload, accountId ?? undefined),
    onSuccess: (_data, { appId }) => {
      // Invalidate campaigns list to refetch
      queryClient.invalidateQueries({
        queryKey: ["campaigns", appId, accountId],
      });
    },
  });
}

// ──────────────────────────────────────────
// UPDATE CAMPAIGN
// ──────────────────────────────────────────

export function useUpdateCampaign() {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appId,
      campaignId,
      payload,
    }: {
      appId: string;
      campaignId: string;
      payload: Partial<CreateCampaignPayload>;
    }) =>
      updateCampaignService(appId, campaignId, payload, accountId ?? undefined),
    onSuccess: (_data, { appId, campaignId }) => {
      // Invalidate both specific campaign and campaigns list
      queryClient.invalidateQueries({
        queryKey: ["campaign", appId, campaignId],
      });
      queryClient.invalidateQueries({
        queryKey: ["campaigns", appId],
      });
    },
  });
}

// ──────────────────────────────────────────
// DELETE CAMPAIGN
// ──────────────────────────────────────────

export function useDeleteCampaign() {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appId,
      campaignId,
    }: {
      appId: string;
      campaignId: string;
    }) => deleteCampaignService(appId, campaignId, accountId ?? undefined),
    onSuccess: (_data, { appId }) => {
      // Invalidate campaigns list to refetch
      queryClient.invalidateQueries({
        queryKey: ["campaigns", appId],
      });
    },
  });
}

// ──────────────────────────────────────────
// SEND CAMPAIGN
// ──────────────────────────────────────────

export function useSendCampaign() {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appId,
      campaignId,
      payload,
    }: {
      appId: string;
      campaignId: string;
      payload?: SendCampaignPayload;
    }) =>
      sendCampaignService(appId, campaignId, payload, accountId ?? undefined),
    onSuccess: (_data, { appId, campaignId }) => {
      // Invalidate campaign and stats queries
      queryClient.invalidateQueries({
        queryKey: ["campaign", appId, campaignId],
      });
      queryClient.invalidateQueries({
        queryKey: ["campaignStats", appId, campaignId],
      });
      queryClient.invalidateQueries({
        queryKey: ["campaigns", appId],
      });
    },
  });
}

// ──────────────────────────────────────────
// SCHEDULE CAMPAIGN
// ──────────────────────────────────────────

export function useScheduleCampaign() {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appId,
      campaignId,
      scheduledAt,
    }: {
      appId: string;
      campaignId: string;
      scheduledAt: string;
    }) =>
      scheduleCampaignService(
        appId,
        campaignId,
        { scheduledAt },
        accountId ?? undefined,
      ),
    onSuccess: (_data, { appId, campaignId }) => {
      // Invalidate both specific campaign and campaigns list
      queryClient.invalidateQueries({
        queryKey: ["campaign", appId, campaignId],
      });
      queryClient.invalidateQueries({
        queryKey: ["campaigns", appId],
      });
    },
  });
}

// ──────────────────────────────────────────
// DUPLICATE CAMPAIGN
// ──────────────────────────────────────────

export function useDuplicateCampaign() {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appId,
      campaignId,
      newName,
    }: {
      appId: string;
      campaignId: string;
      newName: string;
    }) =>
      duplicateCampaignService(
        appId,
        campaignId,
        { newName },
        accountId ?? undefined,
      ),
    onSuccess: (_data, { appId }) => {
      // Invalidate campaigns list to refetch
      queryClient.invalidateQueries({
        queryKey: ["campaigns", appId],
      });
    },
  });
}

// ──────────────────────────────────────────
// GET CAMPAIGN STATISTICS
// ──────────────────────────────────────────

export function useCampaignStats(
  appId: string,
  campaignId: string,
  options?: { enabled?: boolean },
) {
  const accountId = useCurrentAccountId();

  return useQuery({
    queryKey: ["campaignStats", appId, campaignId, accountId],
    queryFn: () =>
      getCampaignStatsService(appId, campaignId, accountId ?? undefined),
    enabled:
      (options?.enabled ?? true) && !!appId && !!campaignId && !!accountId,
  });
}

// ──────────────────────────────────────────
// GET CAMPAIGNS SUMMARY STATISTICS
// ──────────────────────────────────────────

export function useCampaignsSummaryStats(
  appId: string,
  params?: CampaignsSummaryParams,
  options?: { enabled?: boolean },
) {
  const accountId = useCurrentAccountId();

  return useQuery({
    queryKey: ["campaignsSummaryStats", appId, accountId, params],
    queryFn: () =>
      getCampaignsSummaryStatsService(appId, params, accountId ?? undefined),
    enabled: (options?.enabled ?? true) && !!appId && !!accountId,
  });
}
