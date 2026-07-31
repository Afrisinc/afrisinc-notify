import getApiClient from "./apiClient";
import type { PaymentInitPayload, PaymentInitResponse } from "@/types/payment";

const client = () => getApiClient();

export const paymentService = {
  async initializePayment(
    accountId: string,
    payload: PaymentInitPayload,
  ): Promise<PaymentInitResponse> {
    const res = await client().post("/api/payments/initialize", payload, {
      headers: { "x-account-id": accountId },
    });
    return res.data.data;
  },
};
