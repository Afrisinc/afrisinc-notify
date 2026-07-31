import { useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentService } from "@/services/paymentService";
import type { PaymentInitPayload, BillingCycle } from "@/types/payment";

export function useInitializePayment(accountId?: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: PaymentInitPayload) =>
      paymentService.initializePayment(accountId!, payload),
    onSuccess: (data) => {
      if (data.method === "mobile") {
        qc.invalidateQueries({ queryKey: ["payg", "balance", accountId] });
        qc.invalidateQueries({ queryKey: ["payg", "transactions", accountId] });
      }
    },
  });
}

export interface CardPaymentParams {
  type: "payg_topup" | "subscription" | "template_purchase";
  amount?: number;
  planId?: string;
  billingCycle?: BillingCycle;
  templateId?: string;
  appId?: string;
  email: string;
  customerName?: string;
}

export interface MobilePaymentParams {
  type: "payg_topup" | "subscription" | "template_purchase";
  amount?: number;
  planId?: string;
  billingCycle?: BillingCycle;
  templateId?: string;
  appId?: string;
  phoneNumber: string;
  customerName?: string;
}

export function useCardPayment(accountId?: string) {
  const mutation = useInitializePayment(accountId);

  return {
    ...mutation,
    initCardPayment: async (
      params: CardPaymentParams,
    ): Promise<{ checkoutUrl: string; pcode: string }> => {
      let payload: PaymentInitPayload;

      if (params.type === "payg_topup") {
        payload = {
          type: "payg_topup",
          method: "card",
          currency: "USD",
          amount: params.amount!,
          email: params.email,
          customerName: params.customerName,
        };
      } else if (params.type === "subscription") {
        payload = {
          type: "subscription",
          method: "card",
          currency: "USD",
          planId: params.planId!,
          billingCycle: params.billingCycle,
          email: params.email,
          customerName: params.customerName,
        };
      } else {
        payload = {
          type: "template_purchase",
          method: "card",
          currency: "USD",
          templateId: params.templateId!,
          appId: params.appId!,
          email: params.email,
          customerName: params.customerName,
        };
      }

      const result = await mutation.mutateAsync(payload);

      if (result.method !== "card") {
        throw new Error("Expected card payment response");
      }

      return { checkoutUrl: result.checkoutUrl, pcode: result.pcode };
    },
  };
}

export function useMobilePayment(accountId?: string) {
  const mutation = useInitializePayment(accountId);

  return {
    ...mutation,
    initMobilePayment: async (
      params: MobilePaymentParams,
    ): Promise<{ payment: { id: string }; message: string }> => {
      let payload: PaymentInitPayload;

      if (params.type === "payg_topup") {
        payload = {
          type: "payg_topup",
          method: "mobile",
          currency: "USD",
          amount: params.amount!,
          phoneNumber: params.phoneNumber,
          customerName: params.customerName,
        };
      } else if (params.type === "subscription") {
        payload = {
          type: "subscription",
          method: "mobile",
          currency: "USD",
          planId: params.planId!,
          billingCycle: params.billingCycle,
          phoneNumber: params.phoneNumber,
          customerName: params.customerName,
        };
      } else {
        payload = {
          type: "template_purchase",
          method: "mobile",
          currency: "USD",
          templateId: params.templateId!,
          appId: params.appId!,
          phoneNumber: params.phoneNumber,
          customerName: params.customerName,
        };
      }

      const result = await mutation.mutateAsync(payload);

      if (result.method !== "mobile") {
        throw new Error("Expected mobile payment response");
      }

      return {
        payment: { id: result.transaction.id },
        message: result.message,
      };
    },
  };
}

export type { PaymentInitPayload, PaymentInitResponse } from "@/types/payment";
