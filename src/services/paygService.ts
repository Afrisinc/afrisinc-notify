import getApiClient from "./apiClient";

export interface CreditBalance {
  id: string;
  accountId: string;
  balance: number;
  currency: string;
  updatedAt: string;
}

export interface CreditTransaction {
  id: string;
  accountId: string;
  type: "topup" | "deduction" | "bonus" | "refund";
  amount: number;
  balanceAfter: number;
  description: string | null;
  channel: string | null;
  paymentRef: string | null;
  bonusPercent: number | null;
  createdAt: string;
}

export interface PaygRates {
  rates: {
    EMAIL: { ratePerMessage: number; ratePer1000: number; unit: string };
    SMS: { ratePerMessage: number; ratePer1000: number; unit: string };
    PUSH: { ratePerMessage: number; ratePer10000: number; unit: string };
    IN_APP: { ratePerMessage: number; ratePer10000: number; unit: string };
  };
  topUpTiers: { minAmount: number; bonusPercent: number }[];
  minimumTopUp: number;
  currency: string;
  creditsExpire: boolean;
}

export interface TopUpResult {
  transaction: CreditTransaction;
  bonusTransaction: CreditTransaction | null;
  newBalance: number;
  bonusPercent: number;
  bonusAmount: number;
}

export interface TransactionPage {
  items: CreditTransaction[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const client = () => getApiClient();

export interface TopUpInitResult {
  id: string;
  ref: string;
  orderId: string;
  amount: number;
  currency: string;
  email: string;
  type: "CARD";
  status: "PENDING" | "PROCESSING" | "SUCCESSFUL" | "FAILED";
  pcode: string;
  checkoutUrl: string;
  validUntil: string;
  provider: string;
  createdAt: string;
}

export interface MobilePayment {
  id: string;
  ref: string;
  orderId: string;
  amount: number;
  currency: string;
  phoneNumber: string;
  type: "CASHIN" | "CASHOUT";
  status: "PENDING" | "PROCESSING" | "SUCCESSFUL" | "FAILED";
  fee: number;
  provider: string | null;
  createdAt: string;
}

export interface MobileTopUpResult {
  payment: MobilePayment;
  message: string;
}

export const paygService = {
  async getBalance(accountId: string): Promise<CreditBalance> {
    const res = await client().get("/api/payg/balance", {
      headers: { "x-account-id": accountId },
    });
    return res.data.data;
  },

  async initTopUp(
    accountId: string,
    amount: number,
    customerEmail: string,
  ): Promise<TopUpInitResult> {
    const res = await client().post(
      "/api/payg/topup/init",
      { amount, customerEmail },
      { headers: { "x-account-id": accountId } },
    );
    return res.data.data;
  },

  async topUp(
    accountId: string,
    amount: number,
    paymentRef?: string,
  ): Promise<TopUpResult> {
    const res = await client().post(
      "/api/payg/topup",
      { amount, paymentRef },
      { headers: { "x-account-id": accountId } },
    );
    return res.data.data;
  },

  async getTransactions(
    accountId: string,
    page = 1,
    limit = 10,
    type?: string,
  ): Promise<TransactionPage> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (type) params.append("type", type);
    const res = await client().get(`/api/payg/transactions?${params}`, {
      headers: { "x-account-id": accountId },
    });
    return res.data.data;
  },

  async getRates(): Promise<PaygRates> {
    const res = await client().get("/api/payg/rates");
    return res.data.data;
  },

  // ─── Mobile Money ─────────────────────────────────────────────────────────────

  async initMobileTopUp(
    accountId: string,
    amount: number,
    phoneNumber: string,
    customerName?: string,
    options?: {
      paymentType?: "payg_topup" | "subscription";
      planId?: string;
      billingCycle?: "monthly" | "yearly";
    },
  ): Promise<MobileTopUpResult> {
    const res = await client().post(
      "/api/payg/mobile/topup",
      {
        amount,
        phoneNumber,
        customerName,
        ...options,
      },
      { headers: { "x-account-id": accountId } },
    );
    return res.data.data;
  },

  async getMobilePayment(
    accountId: string,
    paymentId: string,
  ): Promise<MobilePayment> {
    const res = await client().get(`/api/payg/mobile/${paymentId}`, {
      headers: { "x-account-id": accountId },
    });
    return res.data.data;
  },

  async getMobilePaymentByRef(
    accountId: string,
    ref: string,
  ): Promise<MobilePayment> {
    const res = await client().get(`/api/payg/mobile/ref/${ref}`, {
      headers: { "x-account-id": accountId },
    });
    return res.data.data;
  },
};
