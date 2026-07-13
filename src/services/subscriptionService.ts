import getApiClient from "./apiClient";

export interface PlanLimit {
  metric: string;
  limit: number; // -1 = unlimited
  used: number;
  remaining: number; // -1 = unlimited
  percentage: number;
  period: string;
}

export interface UsageDashboard {
  plan: string;
  billingCycle: string;
  status: string;
  limits: PlanLimit[];
}

export interface UsageBreakdown {
  period: {
    start: string;
    end: string;
  };
  metrics: Array<{
    metric: string;
    used: number;
    limit: number;
    percentage: number;
  }>;
}

export interface FeatureCheckResult {
  feature: string;
  available: boolean;
  plan: string;
}

export interface UpgradeRecommendation {
  currentPlan: string;
  needsUpgrade: boolean;
  limitedMetrics: Array<{
    metric: string;
    used: number;
    limit: number;
    percentage: number;
  }>;
  recommendedPlan?: {
    name: string;
    priceMonthly: number;
    priceYearly: number;
    improvements: Array<{
      metric: string;
      current: number | string;
      upgraded: number | string;
    }>;
  };
}

export interface PlanLimitDef {
  metric: string;
  limit: number | string; // Can be number or "Unlimited"
  period: string;
}

export interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  limits: PlanLimitDef[];
}

export interface PaygRates {
  email: { rate: number; unit: string };
  sms: { rate: number; unit: string };
  push: { rate: number; unit: string };
  inApp: { rate: number; unit: string };
  whatsapp?: { rate: number; unit: string; comingSoon?: boolean };
}

export interface TopUpBlock {
  amount: number;
  credits: string;
  popular?: boolean;
  bonus?: string;
}

const getClient = () => getApiClient();

export const subscriptionService = {
  /**
   * Get usage dashboard with all plan limits and current usage
   */
  async getUsageDashboard(accountId?: string): Promise<UsageDashboard> {
    const config = accountId ? { headers: { "x-account-id": accountId } } : {};
    const response = await getClient().get(
      "/api/subscriptions/dashboard/usage",
      config,
    );
    return response.data.data;
  },

  /**
   * Get usage breakdown for a specific date range
   */
  async getUsageBreakdown(
    accountId?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<UsageBreakdown> {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const query = params.toString() ? `?${params.toString()}` : "";
    const config = accountId ? { headers: { "x-account-id": accountId } } : {};
    const response = await getClient().get(
      `/api/subscriptions/dashboard/breakdown${query}`,
      config,
    );
    return response.data.data;
  },

  /**
   * Check if a feature is available in the current plan
   */
  async checkFeatureAvailability(
    feature: string,
    accountId?: string,
  ): Promise<FeatureCheckResult> {
    const config = accountId ? { headers: { "x-account-id": accountId } } : {};
    const response = await getClient().get(
      `/api/subscriptions/features/check?feature=${feature}`,
      config,
    );
    return response.data.data;
  },

  /**
   * Get upgrade recommendations based on current usage
   */
  async getUpgradeRecommendations(
    accountId?: string,
  ): Promise<UpgradeRecommendation> {
    const config = accountId ? { headers: { "x-account-id": accountId } } : {};
    const response = await getClient().get(
      "/api/subscriptions/recommendations/upgrade",
      config,
    );
    return response.data.data;
  },

  /**
   * Get all available plans (includes id, name, limits)
   */
  async getPlans(accountId?: string): Promise<Plan[]> {
    const config = accountId ? { headers: { "x-account-id": accountId } } : {};
    const response = await getClient().get("/api/subscriptions/plans", config);
    return response.data.data;
  },

  /**
   * Get public plans - uses same endpoint as authenticated plans
   * For pricing/landing pages
   */
  async getPublicPlans(): Promise<Plan[]> {
    const response = await getClient().get("/api/subscriptions/plans");
    return response.data.data;
  },

  /**
   * Get PAYG rates (public endpoint)
   */
  async getPaygRates(): Promise<PaygRates> {
    const response = await getClient().get("/api/public/payg-rates");
    return response.data.data;
  },

  /**
   * Get top-up blocks (public endpoint)
   */
  async getTopUpBlocks(): Promise<TopUpBlock[]> {
    const response = await getClient().get("/api/public/topup-blocks");
    return response.data.data;
  },

  /**
   * Get subscription details
   */
  async getSubscription(accountId?: string) {
    const config = accountId ? { headers: { "x-account-id": accountId } } : {};
    const response = await getClient().get(
      "/api/subscriptions/current",
      config,
    );
    return response.data.data;
  },

  // ── Trial Subscription Flow (SetupIntent) ────────────────────────────────────

  /**
   * Step 1 of the trial subscription flow.
   * Creates / retrieves a Stripe Customer for this account and returns a
   * SetupIntent clientSecret for stripe.confirmCardSetup() on the frontend.
   */
  async createSetupIntent(
    accountId: string,
    email: string,
    name?: string,
  ): Promise<{
    customerId: string;
    clientSecret: string;
    setupIntentId: string;
  }> {
    const response = await getClient().post(
      "/api/subscriptions/setup-intent",
      { email, name },
      { headers: { "x-account-id": accountId } },
    );
    return response.data.data;
  },

  /**
   * Step 1 (anonymous/public): Creates a Stripe Customer + SetupIntent
   * during signup — before the account exists.
   * No auth header required.
   */
  async createAnonymousSetupIntent(
    email: string,
    name?: string,
  ): Promise<{
    customerId: string;
    clientSecret: string;
    setupIntentId: string;
  }> {
    const response = await getClient().post(
      "/api/subscriptions/setup-intent/anonymous",
      { email, name },
    );
    return response.data.data;
  },

  /**
   * Step 2 of the trial subscription flow.
   * Called after stripe.confirmCardSetup() succeeds.
   * Creates the Stripe Subscription with a 14-day free trial.
   * Stripe owns auto-charge and lifecycle from this point.
   */
  async activateTrialSubscription(
    accountId: string,
    planId: string,
    billingCycle: "monthly" | "annual",
    paymentMethodId: string,
    customerId: string,
  ): Promise<void> {
    await getClient().post(
      "/api/subscriptions/activate",
      { planId, billingCycle, paymentMethodId, customerId },
      { headers: { "x-account-id": accountId } },
    );
  },

  /**
   * Initiate a card payment for plan upgrade via ITEC PesaPal (africnc-pay).
   * Returns checkout URL and PCODE for payment tracking.
   */
  async initSubscriptionPayment(
    planId: string,
    billingCycle: "monthly" | "yearly",
    accountId: string,
    customerEmail: string,
  ): Promise<{
    checkoutUrl: string;
    pcode: string;
    orderId: string;
    amountUSD: number;
    planName: string;
    validUntil: string;
  }> {
    const response = await getClient().post(
      "/api/subscriptions/payment/init",
      { planId, billingCycle, customerEmail },
      { headers: { "x-account-id": accountId } },
    );
    return response.data.data;
  },

  /**
   * Upgrade to a new plan.
   * Resolves plan name → UUID via GET /subscriptions/plans, then calls
   * PUT /subscriptions/plan with the planId the backend already expects.
   */
  async upgradePlan(
    planName: string,
    billingCycle: "monthly" | "yearly" = "monthly",
    accountId?: string,
  ) {
    const config = accountId ? { headers: { "x-account-id": accountId } } : {};

    // Resolve name → id so we use the existing planId-based route
    const plans = await this.getPlans(accountId);
    const match = plans.find(
      (p) => p.name.toUpperCase() === planName.toUpperCase(),
    );
    if (!match) {
      throw new Error(
        `Plan '${planName}' not found. Available: ${plans.map((p) => p.name).join(", ")}`,
      );
    }

    const response = await getClient().put(
      "/api/subscriptions/plan",
      { planId: match.id },
      config,
    );
    return response.data.data;
  },
};
