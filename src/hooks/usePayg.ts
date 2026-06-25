import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { paygService } from "@/services/paygService";
import { subscriptionService } from "@/services/subscriptionService";

export function useInitSubscriptionPayment(accountId?: string) {
  return useMutation({
    mutationFn: ({
      planId,
      billingCycle,
      customerEmail,
    }: {
      planId: string;
      billingCycle: "monthly" | "yearly";
      customerEmail: string;
    }) =>
      subscriptionService.initSubscriptionPayment(
        planId,
        billingCycle,
        accountId!,
        customerEmail,
      ),
  });
}

/**
 * Polls GET /api/subscriptions/current every 3s until the plan name matches
 * expectedPlan (set after Stripe confirms), then stops.
 * Same pattern as useBalanceConfirmation for PAYG.
 */
const SUB_POLL_INTERVAL_MS = 3_000;
const SUB_TIMEOUT_MS = 60_000;

export function useSubscriptionConfirmation(
  expectedPlan: string | null, // null = not waiting
  accountId?: string,
) {
  const qc = useQueryClient();
  const [confirmed, setConfirmed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!accountId || !expectedPlan) return;

    setConfirmed(false);
    setTimedOut(false);

    function stop() {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }

    intervalRef.current = setInterval(async () => {
      try {
        const sub = await subscriptionService.getSubscription(accountId);
        qc.setQueryData(["subscription", accountId], sub);
        if (sub?.plan?.toLowerCase() === expectedPlan.toLowerCase()) {
          stop();
          setConfirmed(true);
          qc.invalidateQueries({ queryKey: ["subscription"] });
        }
      } catch {
        // keep polling
      }
    }, SUB_POLL_INTERVAL_MS);

    timeoutRef.current = setTimeout(() => {
      stop();
      setTimedOut(true);
      qc.invalidateQueries({ queryKey: ["subscription"] });
    }, SUB_TIMEOUT_MS);

    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, expectedPlan]);

  return { confirmed, timedOut };
}

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

export function useInitTopUp(accountId?: string) {
  return useMutation({
    mutationFn: ({
      amount,
      customerEmail,
    }: {
      amount: number;
      customerEmail: string;
    }) => paygService.initTopUp(accountId!, amount, customerEmail),
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

export function useInvalidatePaygBalance(accountId?: string) {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["payg", "balance", accountId] });
    qc.invalidateQueries({ queryKey: ["payg", "transactions", accountId] });
  };
}

/**
 * After a Stripe payment confirms on the client, the balance is credited
 * asynchronously via webhook (Stripe → afrisinc-pay → notification-service).
 * This hook polls the balance every POLL_INTERVAL ms until it reaches the
 * expected value (or TIMEOUT_MS elapses), then stops.
 *
 * Returns:
 *   - confirmed: true once the real balance matches expectedBalance
 *   - timedOut:  true if we gave up waiting
 *   - optimisticBalance: expectedBalance shown immediately while polling
 */

const POLL_INTERVAL_MS = 3_000;
const TIMEOUT_MS = 60_000;

export function useBalanceConfirmation(
  accountId: string | undefined,
  expectedBalance: number | null, // null = not waiting
) {
  const qc = useQueryClient();
  const [confirmed, setConfirmed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Optimistically set cache so the UI shows expectedBalance immediately
  useEffect(() => {
    if (!accountId || expectedBalance === null) return;

    setConfirmed(false);
    setTimedOut(false);

    // Optimistic update — show expected balance right away
    qc.setQueryData(["payg", "balance", accountId], (old: unknown) => {
      if (!old || typeof old !== "object") return old;
      return { ...(old as object), balance: expectedBalance };
    });

    // Poll until real balance matches
    intervalRef.current = setInterval(async () => {
      try {
        const fresh = await paygService.getBalance(accountId);
        qc.setQueryData(["payg", "balance", accountId], fresh);
        if (fresh.balance >= expectedBalance) {
          stop();
          setConfirmed(true);
          // Invalidate transactions too so ledger refreshes
          qc.invalidateQueries({
            queryKey: ["payg", "transactions", accountId],
          });
        }
      } catch {
        // swallow — keep polling
      }
    }, POLL_INTERVAL_MS);

    // Give up after TIMEOUT_MS
    timeoutRef.current = setTimeout(() => {
      stop();
      setTimedOut(true);
      // Final invalidation so at least the cache is fresh
      qc.invalidateQueries({ queryKey: ["payg", "balance", accountId] });
      qc.invalidateQueries({ queryKey: ["payg", "transactions", accountId] });
    }, TIMEOUT_MS);

    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, expectedBalance]);

  function stop() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }

  return { confirmed, timedOut, optimisticBalance: expectedBalance };
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

// ─── Mobile Money Hooks ─────────────────────────────────────────────────────────

export function useInitMobileTopUp(accountId?: string) {
  return useMutation({
    mutationFn: ({
      amount,
      phoneNumber,
      customerName,
      paymentType,
      planId,
      billingCycle,
    }: {
      amount: number;
      phoneNumber: string;
      customerName?: string;
      paymentType?: "payg_topup" | "subscription";
      planId?: string;
      billingCycle?: "monthly" | "yearly";
    }) =>
      paygService.initMobileTopUp(
        accountId!,
        amount,
        phoneNumber,
        customerName,
        {
          paymentType,
          planId,
          billingCycle,
        },
      ),
  });
}

export function useMobilePayment(
  accountId: string | undefined,
  paymentId: string | null,
) {
  return useQuery({
    queryKey: ["payg", "mobile", paymentId],
    queryFn: () => paygService.getMobilePayment(accountId!, paymentId!),
    enabled: !!accountId && !!paymentId,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Stop polling when payment is complete or failed
      if (data?.status === "SUCCESSFUL" || data?.status === "FAILED") {
        return false;
      }
      return 3000; // Poll every 3 seconds while pending
    },
  });
}

export function useMobilePaymentConfirmation(
  accountId: string | undefined,
  paymentId: string | null,
  expectedBalance: number | null,
) {
  const qc = useQueryClient();
  const [confirmed, setConfirmed] = useState(false);
  const [failed, setFailed] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!accountId || !paymentId || expectedBalance === null) return;

    setConfirmed(false);
    setFailed(false);

    function stop() {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }

    intervalRef.current = setInterval(async () => {
      try {
        const payment = await paygService.getMobilePayment(
          accountId,
          paymentId,
        );

        if (payment.status === "SUCCESSFUL") {
          stop();
          setConfirmed(true);
          // Optimistically update balance
          qc.setQueryData(["payg", "balance", accountId], (old: unknown) => {
            if (!old || typeof old !== "object") return old;
            return { ...(old as object), balance: expectedBalance };
          });
          qc.invalidateQueries({ queryKey: ["payg", "balance", accountId] });
          qc.invalidateQueries({
            queryKey: ["payg", "transactions", accountId],
          });
        } else if (payment.status === "FAILED") {
          stop();
          setFailed(true);
        }
      } catch {
        // Keep polling
      }
    }, 3000);

    timeoutRef.current = setTimeout(() => {
      stop();
      // Don't mark as failed on timeout, just stop polling
    }, 120_000); // 2 minute timeout for mobile money

    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, paymentId, expectedBalance]);

  return { confirmed, failed };
}
