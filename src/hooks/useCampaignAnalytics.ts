import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

/**
 * Hook to fetch campaign analytics
 */
export const useCampaignAnalytics = (appId: string, campaignId: string) => {
  return useQuery({
    queryKey: ["campaignAnalytics", appId, campaignId],
    queryFn: async () => {
      const response = await apiClient.get(
        `/api/apps/${appId}/campaigns/${campaignId}/analytics`
      );
      return response.data;
    },
    enabled: !!appId && !!campaignId,
  });
};

/**
 * Hook to fetch campaign event history
 */
export const useCampaignEvents = (
  appId: string,
  campaignId: string,
  filters: {
    eventType?: string;
    page?: number;
    limit?: number;
  } = {}
) => {
  return useQuery({
    queryKey: ["campaignEvents", appId, campaignId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.eventType) params.append("eventType", filters.eventType);
      if (filters.page) params.append("page", String(filters.page));
      if (filters.limit) params.append("limit", String(filters.limit));

      const response = await apiClient.get(
        `/api/apps/${appId}/campaigns/${campaignId}/events?${params.toString()}`
      );
      return response.data;
    },
    enabled: !!appId && !!campaignId,
  });
};

/**
 * Hook to fetch contact interaction with campaign
 */
export const useContactInteraction = (
  appId: string,
  campaignId: string,
  contactId: string
) => {
  return useQuery({
    queryKey: ["contactInteraction", appId, campaignId, contactId],
    queryFn: async () => {
      const response = await apiClient.get(
        `/api/apps/${appId}/campaigns/${campaignId}/contacts/${contactId}/interaction`
      );
      return response.data;
    },
    enabled: !!appId && !!campaignId && !!contactId,
  });
};

/**
 * Hook to fetch top performing campaigns
 */
export const useTopCampaigns = (appId: string, limit: number = 10) => {
  return useQuery({
    queryKey: ["topCampaigns", appId, limit],
    queryFn: async () => {
      const response = await apiClient.get(
        `/api/apps/${appId}/campaigns/analytics/top?limit=${limit}`
      );
      return response.data;
    },
    enabled: !!appId,
  });
};

/**
 * Hook to compare multiple campaigns
 */
export const useCompareCampaigns = () => {
  return useMutation({
    mutationFn: async ({
      appId,
      campaignIds,
    }: {
      appId: string;
      campaignIds: string[];
    }) => {
      const response = await apiClient.post(
        `/api/apps/${appId}/campaigns/analytics/compare`,
        { campaignIds }
      );
      return response.data;
    },
  });
};

/**
 * Hook to record campaign event
 */
export const useRecordCampaignEvent = () => {
  return useMutation({
    mutationFn: async ({
      appId,
      campaignId,
      event,
    }: {
      appId: string;
      campaignId: string;
      event: any;
    }) => {
      const response = await apiClient.post(
        `/api/apps/${appId}/campaigns/${campaignId}/events`,
        event
      );
      return response.data;
    },
  });
};
