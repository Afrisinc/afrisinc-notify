import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  Mail,
  MessageSquare,
  Bell,
  Smartphone,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import BackgroundDecorator from "@/components/auth/BackgroundDecorator";
import { PricingToggle } from "@/components/pricing/PricingToggle";
import { FeatureComparisonTable } from "@/components/pricing/FeatureComparisonTable";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicPlans } from "@/hooks/useSubscription";

// Icon mapping for PAYG rates
const channelIcons: Record<string, LucideIcon> = {
  email: Mail,
  sms: MessageSquare,
  push: Bell,
  inApp: Smartphone,
  whatsapp: MessageCircle,
};

// CTA mapping based on plan name
const planCtas: Record<string, string> = {
  FREE: "Start for free",
  STARTER: "Start 14-day free trial",
  SCALE: "Get Scale",
  ENTERPRISE: "Talk to sales",
};

function PricingSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-6 w-20 mb-4" />
          <Skeleton className="h-10 w-24 mb-2" />
          <Skeleton className="h-4 w-full mb-4" />
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((j) => (
              <Skeleton key={j} className="h-4 w-full" />
            ))}
          </div>
          <Skeleton className="h-10 w-full mt-6" />
        </div>
      ))}
    </div>
  );
}

// Plan descriptions mapping
const planDescriptions: Record<string, string> = {
  FREE: "Email only — test before you commit.",
  STARTER: "All channels unlocked · best entry point.",
  SCALE: "For fast-growing businesses.",
  ENTERPRISE: "Large operations · negotiated volume.",
  PRO: "For growing teams with higher volume.",
};

// Helper to format limit value for display
const formatLimitValue = (limit: number | string): string => {
  if (limit === "Unlimited" || limit === -1) return "Unlimited";
  if (typeof limit === "number") {
    return limit.toLocaleString();
  }
  return String(limit);
};

// Helper to get human-readable metric name
const getMetricLabel = (metric: string): string => {
  const labels: Record<string, string> = {
    emails_per_month: "emails / mo",
    sms_per_month: "SMS / mo",
    push_subscribers: "push subscribers",
    in_app_per_month: "in-app / mo",
    apps: "apps",
    contacts: "contacts",
    custom_domain: "custom sending domain",
    webhooks: "webhooks",
    team_members: "team members",
    api_access: "API access",
  };
  return labels[metric] || metric.replace(/_/g, " ");
};

// Generate features from plan limits
const generatePlanFeatures = (
  limits: Array<{ metric: string; limit: number | string; period: string }>,
  planName: string,
): string[] => {
  const features: string[] = [];
  const keyMetrics = [
    "emails_per_month",
    "sms_per_month",
    "push_subscribers",
    "in_app_per_month",
    "apps",
    "contacts",
    "custom_domain",
    "webhooks",
    "api_access",
  ];

  for (const metric of keyMetrics) {
    const limit = limits.find((l) => l.metric === metric);
    if (limit) {
      const value = formatLimitValue(limit.limit);
      const label = getMetricLabel(metric);
      if (value === "Unlimited") {
        features.push(`Unlimited ${label.replace(" / mo", "")}`);
      } else if (
        metric === "api_access" &&
        (limit.limit === 1 || limit.limit === "1")
      ) {
        features.push("API access");
      } else if (typeof limit.limit === "number" && limit.limit > 0) {
        features.push(`${value} ${label}`);
      } else if (limit.limit === 0 && metric === "custom_domain") {
        features.push("No custom domain");
      }
    }
  }

  // Add support level based on plan
  if (planName === "FREE") {
    features.push("Community support");
  } else if (planName === "STARTER") {
    features.push("Email support (48h)");
  } else if (planName === "SCALE") {
    features.push("Priority support (12h SLA)");
    features.push("Dedicated email IP");
  } else if (planName === "ENTERPRISE") {
    features.push("Dedicated account manager");
    features.push("99.9% uptime SLA");
    features.push("SSO + SAML / LDAP");
  }

  return features.slice(0, 9); // Limit features for UI
};

// Hardcoded PAYG rates (static marketing data)
const paygRates = [
  { name: "Email", icon: Mail, rate: "$0.80", unit: "per 1,000" },
  { name: "SMS", icon: MessageSquare, rate: "$0.035", unit: "per message" },
  { name: "Push", icon: Bell, rate: "$0.50", unit: "per 10,000" },
  { name: "In-App", icon: Smartphone, rate: "$0.40", unit: "per 10,000" },
  {
    name: "WhatsApp",
    icon: MessageCircle,
    rate: "$0.085",
    unit: "per convo",
    comingSoon: true,
  },
];

// Hardcoded top-up blocks (static marketing data)
const topUpBlocks = [
  { amount: "$5", credits: "~6,250 emails" },
  { amount: "$10", credits: "~12,500 emails" },
  { amount: "$25", credits: "~31,000 emails", popular: true },
  { amount: "$50", credits: "~62,500 emails", bonus: "+5%" },
  { amount: "$100", credits: "~125,000 emails", bonus: "+10%" },
  { amount: "$250", credits: "~312,500 emails", bonus: "+15%" },
];

const Pricing = () => {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [pricingView, setPricingView] = useState<"plans" | "payg">("plans");

  const { data: plansData, isLoading: plansLoading } = usePublicPlans();

  // Transform plans data for display (filter out PAYG and PRO plans for public pricing)
  const tiers = (plansData ?? [])
    .filter((p) => p.name !== "PAYG" && p.name !== "PRO")
    .map((plan) => {
      const displayName =
        plan.name.charAt(0) + plan.name.slice(1).toLowerCase();
      const annualSavings =
        plan.priceMonthly > 0 && plan.priceYearly < plan.priceMonthly
          ? (plan.priceMonthly - plan.priceYearly) * 12
          : 0;
      return {
        name: displayName,
        monthlyPrice: plan.priceMonthly === 0 ? "$0" : `$${plan.priceMonthly}`,
        annualPrice: plan.priceYearly === 0 ? "$0" : `$${plan.priceYearly}`,
        annualNote:
          annualSavings > 0
            ? `Billed $${plan.priceYearly * 12}/yr — save $${annualSavings}`
            : undefined,
        description: planDescriptions[plan.name] || "",
        features: generatePlanFeatures(plan.limits, plan.name),
        cta: planCtas[plan.name] ?? `Get ${displayName}`,
        highlighted: plan.name === "STARTER",
        badge: plan.name === "STARTER" ? "Best Value" : undefined,
        priceNote:
          plan.name === "ENTERPRISE" ? "starts from $199 / mo" : undefined,
      };
    });

  return (
    <div className="py-20 bg-gradient-hero relative">
      <BackgroundDecorator />
      <div className="container max-w-5xl relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
            Simple, transparent pricing
          </h1>
          <p className="text-foreground/80 text-lg mb-6">
            No hidden fees. Scale as you grow.
          </p>

          {/* Plans / Pay-as-you-go Toggle */}
          <div className="inline-flex items-center bg-muted/50 border border-border rounded-lg p-1 mb-6">
            <button
              onClick={() => setPricingView("plans")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                pricingView === "plans"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Subscription Plans
            </button>
            <button
              onClick={() => setPricingView("payg")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                pricingView === "payg"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pay-as-you-go
            </button>
          </div>

          {pricingView === "plans" && (
            <div>
              <PricingToggle
                value={billing}
                onChange={setBilling}
                savingsPercent={20}
              />
            </div>
          )}
        </div>

        {/* Subscription Plans */}
        {pricingView === "plans" && plansLoading && <PricingSkeleton />}
        {pricingView === "plans" && !plansLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
            {tiers.map((tier) => {
              const price =
                billing === "monthly" ? tier.monthlyPrice : tier.annualPrice;
              const showAnnualNote =
                billing === "annual" && "annualNote" in tier && tier.annualNote;
              return (
                <div
                  key={tier.name}
                  className={`relative rounded-xl border p-6 flex flex-col ${
                    tier.highlighted
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                      : "border-border bg-card"
                  }`}
                >
                  {"badge" in tier && tier.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                      {tier.badge}
                    </div>
                  )}
                  <h3 className="font-semibold text-lg dark:text-white mt-1">
                    {tier.name}
                  </h3>
                  <div className="mt-2 mb-1">
                    <span className="text-3xl font-bold dark:text-white">
                      {price}
                    </span>
                    {price !== "Custom" && (
                      <span className="text-foreground/70 text-sm">/month</span>
                    )}
                  </div>
                  {"priceNote" in tier && tier.priceNote && (
                    <p className="text-xs text-muted-foreground mb-1">
                      {tier.priceNote}
                    </p>
                  )}
                  {showAnnualNote && (
                    <p className="text-xs text-success mb-1">
                      {tier.annualNote}
                    </p>
                  )}
                  <p className="text-sm text-foreground/75 mb-5">
                    {tier.description}
                  </p>
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {tier.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-sm dark:text-white"
                      >
                        <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={
                      tier.name === "Enterprise"
                        ? "/contact"
                        : `/signup?plan=${tier.name.toUpperCase()}`
                    }
                    className={`text-center text-sm font-medium py-2.5 rounded-lg transition-colors ${
                      tier.highlighted
                        ? "bg-primary text-primary-foreground hover:opacity-90"
                        : "border border-border/80 text-foreground hover:bg-foreground/5 dark:hover:bg-foreground/10"
                    }`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Pay-as-you-go Section */}
        {pricingView === "payg" && (
          <div className="mb-20">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Pay-as-you-go
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                No subscription required. Top up credits and send when you need
                to. Credits never expire.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-foreground">Channel rates</h3>
                <div className="text-sm text-muted-foreground">
                  Min. top-up:{" "}
                  <span className="font-semibold text-foreground">$5</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
                {paygRates.map((rate) => (
                  <div
                    key={rate.name}
                    className="bg-background border border-border rounded-lg p-4 text-center hover:border-primary/30 transition-colors"
                  >
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <rate.icon className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      {rate.name}
                    </p>
                    <p className="text-xl font-bold text-foreground">
                      {rate.rate}
                    </p>
                    <p className="text-xs text-muted-foreground">{rate.unit}</p>
                    {rate.comingSoon && (
                      <span className="inline-block mt-1 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        Soon
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">
                    Credit top-ups
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Bulk bonuses on larger amounts
                  </p>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
                  {topUpBlocks.map((block) => (
                    <div
                      key={block.amount}
                      className={`relative border rounded-lg p-3 text-center transition-colors ${
                        block.popular
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background hover:border-primary/40"
                      }`}
                    >
                      {block.popular && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase">
                          Popular
                        </span>
                      )}
                      <p className="text-lg font-bold text-foreground">
                        {block.amount}
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        {block.credits}
                      </p>
                      {block.bonus && (
                        <p className="text-[10px] text-success font-medium">
                          {block.bonus}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <Link
                  to="/signup?plan=PAYG"
                  className="block w-full text-center py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:border-primary/40 hover:text-primary transition-colors"
                >
                  Get started with Pay-as-you-go
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Feature Comparison */}
        <div className="mb-20">
          <h2 className="heading-section text-center mb-10">
            Compare all features
          </h2>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <FeatureComparisonTable />
          </div>
        </div>

        {/* Pricing FAQ */}
        <PricingFAQ />
      </div>
    </div>
  );
};

export default Pricing;
