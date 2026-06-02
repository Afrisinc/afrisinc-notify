/**
 * Reusable plan pricing utilities.
 *
 * price_yearly in the DB is the monthly-equivalent when billed annually.
 * Actual yearly charge = price_yearly × 12.
 *
 * Examples (PRO plan: $19/mo or $15/mo annually):
 *   computePlanPrice(plan, 'monthly')  → billed $19, displayed "$19/mo"
 *   computePlanPrice(plan, 'yearly')   → billed $180/yr, displayed "$180/yr"
 */

export interface PlanPricing {
  /** True if this is a free plan ($0). */
  isFree: boolean;
  /** Per-month equivalent price (e.g. $15 for PRO annual). */
  perMonth: number;
  /** Actual amount charged per billing period (e.g. $180 for PRO annual). */
  billed: number;
  /** Normalised cycle. */
  cycle: "monthly" | "yearly";
  /** Short unit label: "/mo" or "/yr". */
  periodLabel: string;
  /**
   * Primary display string for the price amount.
   * Free → "Free"  |  monthly → "$19"  |  yearly → "$180"
   */
  display: string;
  /**
   * Secondary note line shown beneath the price.
   * Free → "No cost"
   * Monthly → "billed monthly"
   * Yearly  → "$15/mo · billed $180/yr" (+ "· saves $48/yr" when applicable)
   */
  note: string;
  /** Annual savings vs paying monthly, 0 for monthly/free plans. */
  annualSavings: number;
}

/**
 * Compute all display-ready pricing values for a plan + billing cycle.
 *
 * @param plan           Object with `monthlyPrice` and `yearlyPrice` (per-month equivalent)
 * @param billingCycle   "monthly" | "yearly" | "annual" (any truthy yearly-ish string)
 */
export function computePlanPrice(
  plan: { monthlyPrice: number; yearlyPrice: number },
  billingCycle: string,
): PlanPricing {
  const isYearly = billingCycle === "yearly" || billingCycle === "annual";
  const isFree = plan.monthlyPrice === 0;

  const perMonth = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  const billed = isYearly ? plan.yearlyPrice * 12 : plan.monthlyPrice;
  const annualSavings = isFree
    ? 0
    : Math.max(0, (plan.monthlyPrice - plan.yearlyPrice) * 12);

  let display: string;
  let note: string;

  if (isFree) {
    display = "Free";
    note = "No cost";
  } else if (isYearly) {
    display = `$${billed}`;
    note =
      annualSavings > 0
        ? `$${perMonth}/mo · billed $${billed}/yr · saves $${annualSavings}/yr`
        : `$${perMonth}/mo · billed $${billed}/yr`;
  } else {
    display = `$${billed}`;
    note = "billed monthly";
  }

  return {
    isFree,
    perMonth,
    billed,
    cycle: isYearly ? "yearly" : "monthly",
    periodLabel: isYearly ? "/yr" : "/mo",
    display,
    note,
    annualSavings,
  };
}

/**
 * Format a price for a plan-card grid (always shows the monthly-equivalent
 * so plans are easy to compare side by side).
 *
 * Returns e.g. "$15/mo" with an optional note "billed $180/yr".
 */
export function planCardPrice(plan: {
  monthlyPrice: number;
  yearlyPrice: number;
  isPayg?: boolean;
}): { headline: string; sub: string | null } {
  if (plan.isPayg) return { headline: "Pay per use", sub: null };
  if (plan.monthlyPrice === 0) return { headline: "Free", sub: null };
  return {
    headline: `$${plan.monthlyPrice}`,
    sub:
      plan.yearlyPrice > 0 && plan.yearlyPrice < plan.monthlyPrice
        ? `or $${plan.yearlyPrice}/mo billed annually`
        : null,
  };
}
