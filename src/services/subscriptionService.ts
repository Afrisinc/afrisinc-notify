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
   * Get all available plans
   */
  async getPlans(accountId?: string) {
    const config = accountId ? { headers: { "x-account-id": accountId } } : {};
    const response = await getClient().get("/api/plans", config);
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

  /**
   * Upgrade to a new plan
   */
  async upgradePlan(
    planName: string,
    billingCycle: "monthly" | "yearly" = "monthly",
    accountId?: string,
  ) {
    const config = accountId ? { headers: { "x-account-id": accountId } } : {};
    const response = await getClient().post(
      "/api/subscriptions/upgrade",
      {
        plan: planName,
        billing_cycle: billingCycle,
      },
      config,
    );
    return response.data.data;
  },
};
