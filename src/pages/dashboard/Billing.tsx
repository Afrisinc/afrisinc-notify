import { useState } from "react";
import { useCurrentSubscription } from "@/hooks/useSubscription";
import { useOrg } from "@/contexts/OrgContext";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { UsageDashboard } from "@/components/Subscription/UsageDashboard";
import { UpgradeBanner } from "@/components/Subscription/UpgradeBanner";

interface Plan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: {
    category: string;
    items: {
      name: string;
      included: boolean;
      limit?: string | number;
    }[];
  }[];
}

const PLANS: Plan[] = [
  {
    name: "FREE",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Perfect for getting started",
    features: [
      {
        category: "Emails",
        items: [
          { name: "Emails per month", included: true, limit: "1,000" },
          { name: "SMS per month", included: false },
          { name: "Scheduled sending", included: false },
        ],
      },
      {
        category: "Contacts & Data",
        items: [
          { name: "Total contacts", included: true, limit: "500" },
          { name: "Data retention", included: true, limit: "30 days" },
          { name: "Bulk import", included: false },
        ],
      },
      {
        category: "Templates & Apps",
        items: [
          { name: "Email templates", included: true, limit: "5" },
          { name: "Apps", included: true, limit: "1" },
          { name: "Template marketplace", included: false },
        ],
      },
      {
        category: "Developer",
        items: [
          { name: "API keys", included: true, limit: "1" },
          { name: "API calls/month", included: true, limit: "10,000" },
          { name: "Webhooks", included: false },
        ],
      },
      {
        category: "Team & Support",
        items: [
          { name: "Team members", included: true, limit: "1" },
          { name: "Custom domain", included: false },
          { name: "Advanced analytics", included: false },
          { name: "Priority support", included: false },
        ],
      },
    ],
  },
  {
    name: "PRO",
    monthlyPrice: 29.99,
    yearlyPrice: 299.9,
    description: "For growing teams",
    features: [
      {
        category: "Emails",
        items: [
          { name: "Emails per month", included: true, limit: "100,000" },
          { name: "SMS per month", included: true, limit: "10,000" },
          { name: "Scheduled sending", included: true },
        ],
      },
      {
        category: "Contacts & Data",
        items: [
          { name: "Total contacts", included: true, limit: "100,000" },
          { name: "Data retention", included: true, limit: "90 days" },
          { name: "Bulk import", included: true },
        ],
      },
      {
        category: "Templates & Apps",
        items: [
          { name: "Email templates", included: true, limit: "Unlimited" },
          { name: "Apps", included: true, limit: "10" },
          { name: "Template marketplace", included: true },
        ],
      },
      {
        category: "Developer",
        items: [
          { name: "API keys", included: true, limit: "10" },
          { name: "API calls/month", included: true, limit: "1,000,000" },
          { name: "Webhooks", included: true, limit: "10" },
        ],
      },
      {
        category: "Team & Support",
        items: [
          { name: "Team members", included: true, limit: "5" },
          { name: "Custom domain", included: true },
          { name: "Advanced analytics", included: true },
          { name: "Priority support", included: true },
        ],
      },
    ],
  },
  {
    name: "ENTERPRISE",
    monthlyPrice: 99.99,
    yearlyPrice: 999.9,
    description: "For large scale operations",
    features: [
      {
        category: "Emails",
        items: [
          { name: "Emails per month", included: true, limit: "Unlimited" },
          { name: "SMS per month", included: true, limit: "Unlimited" },
          { name: "Scheduled sending", included: true },
        ],
      },
      {
        category: "Contacts & Data",
        items: [
          { name: "Total contacts", included: true, limit: "Unlimited" },
          { name: "Data retention", included: true, limit: "1 year" },
          { name: "Bulk import", included: true },
        ],
      },
      {
        category: "Templates & Apps",
        items: [
          { name: "Email templates", included: true, limit: "Unlimited" },
          { name: "Apps", included: true, limit: "Unlimited" },
          { name: "Template marketplace", included: true },
        ],
      },
      {
        category: "Developer",
        items: [
          { name: "API keys", included: true, limit: "Unlimited" },
          { name: "API calls/month", included: true, limit: "Unlimited" },
          { name: "Webhooks", included: true, limit: "Unlimited" },
        ],
      },
      {
        category: "Team & Support",
        items: [
          { name: "Team members", included: true, limit: "Unlimited" },
          { name: "Custom domain", included: true },
          { name: "Advanced analytics", included: true },
          { name: "24/7 Priority support", included: true },
        ],
      },
    ],
  },
];

export default function Billing() {
  const { currentOrg } = useOrg();
  const { getAccountIdForOrg } = useUser();
  const accountId = currentOrg ? getAccountIdForOrg(currentOrg.id) : undefined;
  const { data: subscription, isLoading } = useCurrentSubscription(
    accountId ?? undefined,
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-content">Billing & Plans</h1>
        <p className="text-content-secondary mt-2">
          Manage your subscription and view your usage limits
        </p>
      </div>

      {/* We need to build navigation tabs for Usage section and Billinng and subscription Hist */}

      <Tabs defaultValue="usage" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="usage">Current Usage</TabsTrigger>
          <TabsTrigger value="billings-history">
            Billings and Subscriptions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4 mt-4">
          <div className="space-y-2">
            {/* Usage Dashboard */}
            <div>
              <UsageDashboard />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="billings-history" className="space-y-4 mt-4">
          <div className="space-y-2">
            {/* Upgrade Banner */}
            <UpgradeBanner />
          </div>
        </TabsContent>
      </Tabs>

      {/* FAQ Section */}
      <Card className="border-border/60 bg-content/3">
        <CardHeader>
          <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="billing" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="limits">Limits</TabsTrigger>
              <TabsTrigger value="upgrade">Upgrade</TabsTrigger>
            </TabsList>

            <TabsContent value="billing" className="space-y-4 mt-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-content">
                  When will I be charged?
                </h4>
                <p className="text-sm text-content-secondary">
                  You'll be charged at the beginning of each billing cycle. For
                  monthly plans, this is every 30 days. For yearly plans, every
                  365 days.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-content">
                  Can I change my plan?
                </h4>
                <p className="text-sm text-content-secondary">
                  Yes! You can upgrade or downgrade your plan at any time.
                  Changes take effect immediately.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="limits" className="space-y-4 mt-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-content">
                  What happens when I reach my limit?
                </h4>
                <p className="text-sm text-content-secondary">
                  When you reach your usage limit, you won't be able to perform
                  that action until the limit resets or you upgrade your plan.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-content">
                  When do limits reset?
                </h4>
                <p className="text-sm text-content-secondary">
                  Monthly limits reset on the 1st of each month. Yearly limits
                  reset annually. Some limits (like contacts) don't reset.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="upgrade" className="space-y-4 mt-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-content">
                  Will I lose data if I downgrade?
                </h4>
                <p className="text-sm text-content-secondary">
                  No, downgrading won't delete your data. However, you may not
                  be able to create new resources if you exceed the plan limits.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-content">
                  Do you offer custom plans?
                </h4>
                <p className="text-sm text-content-secondary">
                  Yes! Contact our sales team for custom enterprise pricing and
                  features.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Info */}
      <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10">
        <Zap className="h-5 w-5 text-primary flex-shrink-0" />
        <p className="text-sm text-primary">
          💡 Tip: The PRO plan offers the best value for most teams. Upgrade to
          unlock advanced features and higher limits.
        </p>
      </div>
    </div>
  );
}
