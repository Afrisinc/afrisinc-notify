import { Check, Sparkles } from "lucide-react";
import type { PlanInfo } from "@/components/auth/signup/schemas";

export interface PlanCardsProps {
  plans: PlanInfo[];
  selectedPlan: PlanInfo | null;
  onPlanChange: (plan: PlanInfo) => void;
  billingCycle: "monthly" | "annual";
  className?: string; // Optional className to override grid
}

export const PlanCards = ({
  plans,
  selectedPlan,
  onPlanChange,
  billingCycle,
  className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4",
}: PlanCardsProps) => {
  return (
    <div className={className}>
      {plans.map((plan) => {
        const isSelected = selectedPlan?.id === plan.id;
        const planPrice =
          billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;
        const isPlanPaid = plan.priceMonthly > 0;
        const planTrial = plan.trialDays ?? (isPlanPaid ? 14 : 0);

        return (
          <div
            key={plan.id}
            onClick={() => onPlanChange(plan)}
            className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all text-left flex flex-col ${
              isSelected
                ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-md"
                : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
            }`}
          >
            {isPlanPaid && planTrial > 0 && isSelected && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-success text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                <Sparkles className="h-3 w-3" />
                {planTrial}-day trial
              </div>
            )}

            <div className="mb-4">
              <h3 className="font-semibold text-xl text-foreground">
                {plan.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1.5 min-h-[40px]">
                {plan.description}
              </p>

              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-3xl font-bold text-foreground">
                  ${planPrice}
                </span>
                <span className="text-muted-foreground text-sm">/mo</span>
              </div>
              {billingCycle === "annual" && isPlanPaid ? (
                <p className="text-xs text-muted-foreground mt-1">
                  Billed annually at ${plan.priceYearly * 12}
                </p>
              ) : (
                <div className="h-5 mt-1" /> /* placeholder to keep price heights aligned */
              )}
            </div>

            <div className="space-y-3 mt-4 pt-4 border-t border-border/50 flex-1">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Features
              </p>
              {(plan.features ?? []).map((feature) => (
                <div
                  key={feature}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
