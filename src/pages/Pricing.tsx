import { Link } from "react-router-dom";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "For side projects and testing.",
    features: ["100 notifications/mo", "1 template", "Email channel", "7-day log retention"],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    description: "For growing teams and products.",
    features: ["10,000 notifications/mo", "Unlimited templates", "All channels", "30-day log retention", "Priority support"],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large-scale operations.",
    features: ["Unlimited notifications", "Unlimited templates", "All channels", "1-year log retention", "Dedicated support", "SLA guarantee"],
    cta: "Contact sales",
    highlighted: false,
  },
];

const Pricing = () => {
  return (
    <div className="py-20">
      <div className="container max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h1>
          <p className="text-muted-foreground text-lg">No hidden fees. Scale as you grow.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-xl border p-8 flex flex-col ${
                tier.highlighted
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-border bg-card"
              }`}
            >
              <h3 className="font-semibold text-lg">{tier.name}</h3>
              <div className="mt-2 mb-1">
                <span className="text-3xl font-bold">{tier.price}</span>
                {tier.price !== "Custom" && <span className="text-muted-foreground text-sm">/month</span>}
              </div>
              <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
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
                    : "border border-border hover:bg-secondary"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
