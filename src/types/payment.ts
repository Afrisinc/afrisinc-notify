export type PaymentType = "payg_topup" | "subscription" | "template_purchase";
export type PaymentMethod = "card" | "mobile";
export type BillingCycle = "monthly" | "yearly";
export type PaymentStatus = "PENDING" | "PROCESSING" | "SUCCESSFUL" | "FAILED";

interface BasePaymentPayload {
  type: PaymentType;
  method: PaymentMethod;
  currency: "USD";
  customerName?: string;
}

export interface PaygTopupCardPayload extends BasePaymentPayload {
  type: "payg_topup";
  method: "card";
  amount: number;
  email: string;
}

export interface PaygTopupMobilePayload extends BasePaymentPayload {
  type: "payg_topup";
  method: "mobile";
  amount: number;
  phoneNumber: string;
}

export interface SubscriptionCardPayload extends BasePaymentPayload {
  type: "subscription";
  method: "card";
  planId: string;
  billingCycle?: BillingCycle;
  email: string;
}

export interface SubscriptionMobilePayload extends BasePaymentPayload {
  type: "subscription";
  method: "mobile";
  planId: string;
  billingCycle?: BillingCycle;
  phoneNumber: string;
}

export interface TemplatePurchaseCardPayload extends BasePaymentPayload {
  type: "template_purchase";
  method: "card";
  templateId: string;
  appId: string;
  email: string;
}

export interface TemplatePurchaseMobilePayload extends BasePaymentPayload {
  type: "template_purchase";
  method: "mobile";
  templateId: string;
  appId: string;
  phoneNumber: string;
}

export type PaymentInitPayload =
  | PaygTopupCardPayload
  | PaygTopupMobilePayload
  | SubscriptionCardPayload
  | SubscriptionMobilePayload
  | TemplatePurchaseCardPayload
  | TemplatePurchaseMobilePayload;

export interface PaymentTransaction {
  id: string;
  accountId: string;
  type: "topup" | "subscription";
  status: PaymentStatus;
  amount: number;
  balanceAfter: number;
  description: string;
  paymentRef: string;
  createdAt: string;
}

interface BasePaymentResponse {
  transaction: PaymentTransaction;
  orderId: string;
  amountUSD: number;
  amountRWF: number;
  method: PaymentMethod;
  message: string;
}

export interface CardPaymentInitResponse extends BasePaymentResponse {
  method: "card";
  checkoutUrl: string;
  pcode: string;
}

export interface MobilePaymentInitResponse extends BasePaymentResponse {
  method: "mobile";
  paymentRef: string;
}

export type PaymentInitResponse =
  | CardPaymentInitResponse
  | MobilePaymentInitResponse;

export function isCardPaymentResponse(
  res: PaymentInitResponse,
): res is CardPaymentInitResponse {
  return res.method === "card";
}

export function isMobilePaymentResponse(
  res: PaymentInitResponse,
): res is MobilePaymentInitResponse {
  return res.method === "mobile";
}

export interface PaymentStatusResponse {
  transaction_id: string;
  status: PaymentStatus;
  amount: number;
}
