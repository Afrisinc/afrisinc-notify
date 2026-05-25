import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paygService } from "@/services/paygService";
import { subscriptionService } from "@/services/subscriptionService";

export function usePaygBalance(accountId?: string) {
  return useQuery({
    queryKey: ["payg", "balance", accountId],
    queryFn: () => paygService.getBalance(accountId!),
    enabled: !!accountId,
    staleTime: 30 * 1000,
  });
}

export function usePaygTransactions(accountId?: string, page = 1) {
  return useQuery({
    queryKey: ["payg", "transactions", accountId, page],
    queryFn: () => paygService.getTransactions(accountId!, page),
    enabled: !!accountId,
    staleTime: 60 * 1000,
  });
}

export function usePaygRates() {
  return useQuery({
    queryKey: ["payg", "rates"],
    queryFn: paygService.getRates,
    staleTime: 60 * 60 * 1000,
  });
}

export function useTopUp(accountId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ amount }: { amount: number }) =>
      paygService.topUp(accountId!, amount),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payg", "balance", accountId] });
      qc.invalidateQueries({ queryKey: ["payg", "transactions", accountId] });
    },
  });
}

export function useUpgradePlan(accountId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      plan,
      billingCycle,
    }: {
      plan: string;
      billingCycle: "monthly" | "yearly";
    }) => subscriptionService.upgradePlan(plan, billingCycle, accountId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscription"] });
    },
  });
}
