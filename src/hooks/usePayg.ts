import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { paygService } from "@/services/paygService";
import { paymentService } from "@/services/paymentService";
import { subscriptionService } from "@/services/subscriptionService";

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

export function useMobilePaymentConfirmation(
  accountId: string | undefined,
  paymentRef: string | null,
  expectedBalance: number | null,
) {
  const qc = useQueryClient();
  const [confirmed, setConfirmed] = useState(false);
  const [failed, setFailed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!accountId || !paymentRef) return;

    setConfirmed(false);
    setFailed(false);
    setTimedOut(false);

    function stop() {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }

    intervalRef.current = setInterval(async () => {
      try {
        const { status } = await paymentService.getPaymentStatus(
          accountId,
          paymentRef,
        );

        if (status === "SUCCESSFUL") {
          stop();
          setConfirmed(true);
          if (expectedBalance !== null) {
            qc.setQueryData(["payg", "balance", accountId], (old: unknown) => {
              if (!old || typeof old !== "object") return old;
              return { ...(old as object), balance: expectedBalance };
            });
          }
          qc.invalidateQueries({ queryKey: ["payg", "balance", accountId] });
          qc.invalidateQueries({
            queryKey: ["payg", "transactions", accountId],
          });
        } else if (status === "FAILED") {
          stop();
          setFailed(true);
        }
      } catch {
        // Keep polling
      }
    }, 3000);

    timeoutRef.current = setTimeout(() => {
      stop();
      setTimedOut(true);
    }, 120_000);

    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, paymentRef, expectedBalance]);

  return { confirmed, failed, timedOut };
}
