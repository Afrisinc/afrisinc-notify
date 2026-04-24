import { useQuery } from "@tanstack/react-query";
import { subscriptionService } from "@/services/subscriptionService";

/**
 * Hook to fetch usage dashboard data
 */
export function useUsageDashboard(accountId?: string) {
  return useQuery({
    queryKey: ["subscription", "dashboard", accountId],
    queryFn: () => subscriptionService.getUsageDashboard(accountId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    enabled: !!accountId,
  });
}

/**
 * Hook to fetch usage breakdown for a date range
 */
export function useUsageBreakdown(
  accountId?: string,
  startDate?: string,
  endDate?: string,
) {
  return useQuery({
    queryKey: ["subscription", "breakdown", accountId, startDate, endDate],
    queryFn: () =>
      subscriptionService.getUsageBreakdown(accountId, startDate, endDate),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    enabled: !!accountId && (!!startDate || !!endDate),
  });
}

/**
 * Hook to check if a feature is available
 */
export function useFeatureCheck(feature: string, accountId?: string) {
  const { data, isLoading } = useQuery({
    queryKey: ["subscription", "feature", feature, accountId],
    queryFn: () =>
      subscriptionService.checkFeatureAvailability(feature, accountId),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
    enabled: !!feature && !!accountId,
  });

  return {
    available: data?.available ?? false,
    plan: data?.plan,
    isLoading,
  };
}

/**
 * Hook to get upgrade recommendations
 */
export function useUpgradeRecommendations(accountId?: string) {
  return useQuery({
    queryKey: ["subscription", "recommendations", accountId],
    queryFn: () => subscriptionService.getUpgradeRecommendations(accountId),
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    enabled: !!accountId,
  });
}

/**
 * Hook to get available plans
 */
export function usePlans(accountId?: string) {
  return useQuery({
    queryKey: ["plans", accountId],
    queryFn: () => subscriptionService.getPlans(accountId),
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
    enabled: !!accountId,
  });
}

/**
 * Hook to get current subscription
 */
export function useCurrentSubscription(accountId?: string) {
  return useQuery({
    queryKey: ["subscription", "current", accountId],
    queryFn: () => subscriptionService.getSubscription(accountId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    enabled: !!accountId,
  });
}
