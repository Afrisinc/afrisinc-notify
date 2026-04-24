import { useState } from "react";
import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import BackgroundDecorator from "@/components/auth/BackgroundDecorator";
import { PricingToggle } from "@/components/pricing/PricingToggle";
import { FeatureComparisonTable } from "@/components/pricing/FeatureComparisonTable";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";

const tiers = [
  {
    name: "Free",
    monthlyPrice: "$0",
    annualPrice: "$0",
    description: "For side projects and testing.",
    features: [
      "100 notifications/mo",
      "1 template",
      "Email channel",
      "7-day log retention",
    ],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Pro",
    monthlyPrice: "$29",
    annualPrice: "$23",
    description: "For growing teams and products.",
    features: [
      "10,000 notifications/mo",
      "Unlimited templates",
      "All channels",
      "30-day log retention",
      "Priority support",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    monthlyPrice: "Custom",
    annualPrice: "Custom",
    description: "For large-scale operations.",
    features: [
      "Unlimited notifications",
      "Unlimited templates",
      "All channels",
      "1-year log retention",
      "Dedicated support",
      "SLA guarantee",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
];

const Pricing = () => {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  return (
    <div className="py-20 bg-gradient-hero relative">
      <BackgroundDecorator />
      <div className="container max-w-5xl relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">
            Simple, transparent pricing
          </h1>
          <p className="text-foreground/80 text-lg mb-8">
            No hidden fees. Scale as you grow.
          </p>
          <PricingToggle
            value={billing}
            onChange={setBilling}
            savingsPercent={20}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {tiers.map((tier) => {
            const price =
              billing === "monthly" ? tier.monthlyPrice : tier.annualPrice;
            return (
              <div
                key={tier.name}
                className={`rounded-xl border p-8 flex flex-col ${
                  tier.highlighted
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border bg-card"
                }`}
              >
                <h3 className="font-semibold text-lg dark:text-white">
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
                <p className="text-sm text-foreground/75 mb-6">
                  {tier.description}
                </p>
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm dark:text-white"
                    >
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
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
