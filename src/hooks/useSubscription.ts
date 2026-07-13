import { useQuery, useMutation } from "@tanstack/react-query";
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
 * Hook to get available plans (authenticated)
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
 * Hook to get public plans (no auth required) - for pricing/landing pages
 */
export function usePublicPlans() {
  return useQuery({
    queryKey: ["public-plans"],
    queryFn: () => subscriptionService.getPublicPlans(),
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
  });
}

/**
 * Hook to get PAYG rates (public)
 */
export function usePaygRates() {
  return useQuery({
    queryKey: ["payg-rates"],
    queryFn: () => subscriptionService.getPaygRates(),
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
  });
}

/**
 * Hook to get top-up blocks (public)
 */
export function useTopUpBlocks() {
  return useQuery({
    queryKey: ["topup-blocks"],
    queryFn: () => subscriptionService.getTopUpBlocks(),
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
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

/**
 * Mutation: Step 1 — create a Stripe Customer + SetupIntent.
 * Returns { customerId, clientSecret, setupIntentId }.
 * The frontend passes clientSecret to stripe.confirmCardSetup().
 */
export function useCreateSetupIntent() {
  return useMutation({
    mutationFn: ({
      accountId,
      email,
      name,
    }: {
      accountId: string;
      email: string;
      name?: string;
    }) => subscriptionService.createSetupIntent(accountId, email, name),
  });
}

/**
 * Mutation: Step 2 — create Stripe Subscription after card confirmed.
 * Stripe owns auto-charge and trial lifecycle from this point.
 */
export function useActivateTrialSubscription() {
  return useMutation({
    mutationFn: ({
      accountId,
      planId,
      billingCycle,
      paymentMethodId,
      customerId,
    }: {
      accountId: string;
      planId: string;
      billingCycle: "monthly" | "annual";
      paymentMethodId: string;
      customerId: string;
    }) =>
      subscriptionService.activateTrialSubscription(
        accountId,
        planId,
        billingCycle,
        paymentMethodId,
        customerId,
      ),
  });
}

/**
 * Mutation: Initiate subscription payment via PesaPal (africnc-pay).
 * Returns checkout URL and PCODE for redirect pattern.
 * After payment is confirmed, webhook activates the subscription.
 */
export function useInitSubscriptionPayment() {
  return useMutation({
    mutationFn: ({
      accountId,
      planId,
      billingCycle,
      customerEmail,
    }: {
      accountId: string;
      planId: string;
      billingCycle: "monthly" | "yearly";
      customerEmail: string;
    }) =>
      subscriptionService.initSubscriptionPayment(
        planId,
        billingCycle,
        accountId,
        customerEmail,
      ),
  });
}
