import { useState } from "react";
import { useOrg } from "@/contexts/OrgContext";
import { useUser } from "@/contexts/UserContext";
import { computePlanPrice, planCardPrice } from "@/lib/pricing";
import {
  useCurrentSubscription,
  useUsageDashboard,
  usePlans,
} from "@/hooks/useSubscription";
import type { Plan } from "@/services/subscriptionService";
import { usePaygBalance, usePaygTransactions } from "@/hooks/usePayg";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { TopUpDialog } from "@/components/billing/TopUpDialog";
import {
  PlanUpgradeDialog,
  type PlanOption,
} from "@/components/billing/PlanUpgradeDialog";
import {
  Zap,
  CreditCard,
  Check,
  ArrowRight,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

// ─── Static data ───────────────────────────────────────────────────────────────

const TX_LABEL: Record<string, string> = {
  topup: "Top-up",
  deduction: "Usage",
  bonus: "Bonus",
  refund: "Refund",
};
const TX_SIGN: Record<string, string> = {
  topup: "+",
  bonus: "+",
  deduction: "−",
  refund: "+",
};
const TX_COLOR: Record<string, string> = {
  topup: "text-success",
  bonus: "text-success",
  deduction: "text-content-secondary",
  refund: "text-primary",
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function metricLabel(m: string) {
  return m
    .replace(/_per_month|_per_day/g, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <Skeleton className="h-7 w-40" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function Billing() {
  const { currentOrg } = useOrg();
  const { getAccountIdForOrg, profile } = useUser();
  const accountId = currentOrg
    ? (getAccountIdForOrg(currentOrg.id) ?? undefined)
    : undefined;
  const customerEmail = profile?.email ?? "";

  const { data: sub, isLoading: subLoading } =
    useCurrentSubscription(accountId);
  const { data: usage, isLoading: usageLoading } = useUsageDashboard(accountId);
  const { data: bal, isLoading: balLoading } = usePaygBalance(accountId);
  const { data: txPage } = usePaygTransactions(accountId);
  const { data: plansData, isLoading: plansLoading } = usePlans(accountId);

  const [topUpOpen, setTopUpOpen] = useState(false);
  const [upgradeTarget, setUpgradeTarget] = useState<PlanOption | null>(null);
  const [activeTab, setActiveTab] = useState("plans");

  // Helper to format limit value for display
  const formatLimit = (limit: number | string, metric: string): string => {
    if (limit === "Unlimited" || limit === -1) return "Unlimited";
    if (typeof limit === "number") {
      if (metric.includes("per_month")) {
        return `${limit.toLocaleString()} / mo`;
      }
      return limit.toLocaleString();
    }
    return String(limit);
  };

  // Helper to get human-readable metric name
  const getMetricLabel = (metric: string): string => {
    const labels: Record<string, string> = {
      emails_per_month: "emails",
      sms_per_month: "SMS",
      push_subscribers: "push subscribers",
      in_app_per_month: "in-app",
      apps: "apps",
      contacts: "contacts",
      custom_domain: "custom domains",
      webhooks: "webhooks",
      team_members: "team members",
    };
    return labels[metric] || metric.replace(/_/g, " ");
  };

  // Generate features from plan limits
  const generateFeatures = (
    limits: Plan["limits"],
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
    ];

    for (const metric of keyMetrics) {
      const limit = limits.find((l) => l.metric === metric);
      if (
        limit &&
        (limit.limit === "Unlimited" ||
          (typeof limit.limit === "number" && limit.limit > 0))
      ) {
        const label = getMetricLabel(metric);
        const value = formatLimit(limit.limit, metric);
        features.push(`${value} ${label}`);
      }
    }

    // Add special features based on plan
    if (planName === "PAYG") {
      features.push("Credits never expire");
      features.push("No monthly commitment");
    }

    return features.slice(0, 7); // Limit to 7 features for UI
  };

  // Transform API plans to PlanOption format
  const plans: PlanOption[] = (plansData ?? []).map((p: Plan) => ({
    id: p.id,
    name: p.name,
    displayName: p.name.charAt(0) + p.name.slice(1).toLowerCase(), // FREE -> Free
    monthlyPrice: p.priceMonthly,
    yearlyPrice: p.priceYearly,
    annualNote:
      p.priceYearly > 0 && p.priceYearly < p.priceMonthly
        ? `Billed $${p.priceYearly * 12}/yr — save $${(p.priceMonthly - p.priceYearly) * 12}`
        : undefined,
    features: generateFeatures(p.limits, p.name),
    isPayg: p.name === "PAYG",
  }));

  if (subLoading || balLoading || usageLoading || plansLoading)
    return <PageSkeleton />;

  // derived
  const planName: string = (sub as any)?.plan ?? (usage as any)?.plan ?? "FREE";
  const isPayg = planName === "PAYG";
  const planStatus: string = (sub as any)?.status ?? "active";
  const billing: string = (sub as any)?.billingCycle ?? "monthly";
  const balAmt = bal?.balance ?? 0;
  const planMeta = plans.find((p) => p.name === planName);
  // priceInfo reflects what this account actually pays (respects their billing cycle)
  const priceInfo =
    planMeta && !isPayg ? computePlanPrice(planMeta, billing) : null;
  const allLimits: any[] = ((usage as any)?.limits ?? []).filter(
    (l: any) => l.limit > 0,
  );

  const balColor =
    balAmt === 0
      ? "text-destructive"
      : balAmt < 5
        ? "text-warning"
        : "text-foreground";
  const balBorder =
    balAmt === 0
      ? "border-danger/30 bg-danger/5"
      : balAmt < 5
        ? "border-warning/30 bg-warning/5"
        : "border-border/60";

  function getNextPlan() {
    const idx = plans.findIndex((p) => p.name === planName);
    return plans.slice(idx + 1).find((p) => !p.isPayg && p.monthlyPrice > 0);
  }

  function handleUpgradeSuccess(isPaygSwitch: boolean) {
    if (isPaygSwitch) {
      setActiveTab("history");
      setTopUpOpen(true);
    }
  }

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-content">Billing</h1>
        <p className="text-sm text-content-secondary mt-0.5">
          Manage your plan, credits and usage
        </p>
      </div>

      {/* ── Hero cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 1 — Balance or Plan cost */}
        <div
          className={`rounded-xl border p-5 ${isPayg ? balBorder : "border-border/60 bg-card"}`}
        >
          <p className="text-xs text-content-secondary uppercase tracking-wide">
            {isPayg ? "Credit balance" : "Current plan"}
          </p>
          {isPayg ? (
            <>
              <p className={`text-3xl font-bold mt-2 ${balColor}`}>
                ${balAmt.toFixed(2)}
              </p>
              <p className="text-xs text-content-secondary mt-0.5">
                {balAmt === 0
                  ? "No credits — add funds to send"
                  : balAmt < 5
                    ? "Running low"
                    : "Credits never expire"}
              </p>
              <Button
                size="sm"
                className="gap-1.5 mt-4"
                onClick={() => setTopUpOpen(true)}
              >
                <Zap className="h-3.5 w-3.5" /> Add funds
              </Button>
            </>
          ) : (
            <>
              <div className="mt-2">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-3xl font-bold text-content">
                    {priceInfo?.display ?? "Free"}
                  </span>
                  {priceInfo && !priceInfo.isFree && (
                    <span className="text-sm text-content-secondary">
                      {priceInfo.periodLabel}
                    </span>
                  )}
                </div>
                <p className="text-xs text-content-secondary mt-0.5">
                  {priceInfo?.note ?? "No cost"}
                </p>
              </div>
              <button
                className="mt-4 flex items-center gap-0.5 text-xs text-primary hover:underline"
                onClick={() => {
                  const p = getNextPlan();
                  if (p) setUpgradeTarget(p);
                }}
              >
                Upgrade plan <ChevronRight className="h-3 w-3" />
              </button>
            </>
          )}
        </div>

        {/* 2 — Usage summary */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <p className="text-xs text-content-secondary uppercase tracking-wide">
            Usage this month
          </p>
          {allLimits.length > 0 ? (
            (() => {
              const top = [...allLimits].sort(
                (a, b) => b.percentage - a.percentage,
              )[0];
              const pct = Math.min(top.percentage, 100);
              const barCls =
                pct >= 95
                  ? "bg-danger"
                  : pct >= 80
                    ? "bg-warning"
                    : "bg-primary";
              return (
                <>
                  <p className="text-3xl font-bold text-content mt-2">
                    {top.used.toLocaleString()}
                  </p>
                  <p className="text-xs text-content-secondary mt-0.5 capitalize">
                    {metricLabel(top.metric)} · of{" "}
                    {top.limit === -1 ? "∞" : top.limit.toLocaleString()}
                  </p>
                  <div className="mt-3 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barCls}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </>
              );
            })()
          ) : (
            <>
              <p className="text-3xl font-bold text-content mt-2">—</p>
              <p className="text-xs text-content-secondary mt-0.5">
                No activity this month
              </p>
            </>
          )}
        </div>

        {/* 3 — Plan status */}
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <p className="text-xs text-content-secondary uppercase tracking-wide">
            Plan
          </p>
          <p className="text-3xl font-bold text-content mt-2">
            {planMeta?.displayName ?? planName}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-success inline-block" />
            <span className="text-xs text-content-secondary capitalize">
              {planStatus}
            </span>
            {!isPayg && (
              <span className="text-xs text-content-secondary">
                · {billing}
              </span>
            )}
          </div>
          <button
            className="mt-4 flex items-center gap-0.5 text-xs text-primary hover:underline"
            onClick={() => {
              if (isPayg) {
                // Open upgrade dialog with Starter plan
                const starterPlan = plans.find((p) => p.name === "STARTER");
                if (starterPlan) setUpgradeTarget(starterPlan);
              } else {
                setActiveTab("plans");
              }
            }}
          >
            {isPayg ? "Switch to subscription" : "View all plans"}{" "}
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* ── Low balance banner ──────────────────────────────────────────── */}
      {isPayg && balAmt < 5 && (
        <div
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
            balAmt === 0
              ? "border-danger/30 bg-danger/5"
              : "border-warning/30 bg-warning/5"
          }`}
        >
          <AlertCircle
            className={`h-4 w-4 shrink-0 ${balAmt === 0 ? "text-danger" : "text-warning"}`}
          />
          <p
            className={`text-sm flex-1 ${balAmt === 0 ? "text-danger" : "text-warning"}`}
          >
            {balAmt === 0
              ? "No credits remaining. Add funds to resume sending."
              : `Balance low ($${balAmt.toFixed(2)}). Top up to avoid interruption.`}
          </p>
          <Button size="sm" onClick={() => setTopUpOpen(true)}>
            Add funds
          </Button>
        </div>
      )}

      {/* ── Usage rows ──────────────────────────────────────────────────── */}
      {allLimits.length > 0 && (
        <div className="rounded-xl border border-border/60 overflow-hidden">
          <div className="divide-y divide-border/40">
            {allLimits.map((l: any) => {
              const pct = l.limit === -1 ? 0 : Math.min(l.percentage, 100);
              const remaining =
                l.limit === -1 ? null : Math.max(0, l.limit - l.used);
              const barCls =
                pct >= 95
                  ? "bg-danger"
                  : pct >= 80
                    ? "bg-warning"
                    : "bg-primary";
              const numCls =
                pct >= 95
                  ? "text-danger"
                  : pct >= 80
                    ? "text-warning"
                    : "text-content-secondary";
              return (
                <div
                  key={l.metric}
                  className="flex items-center gap-4 px-5 py-3.5 bg-card hover:bg-muted/20 transition-colors"
                >
                  <p className="text-sm text-content w-44 shrink-0 capitalize">
                    {metricLabel(l.metric)}
                  </p>
                  <div className="flex-1 min-w-0">
                    {l.limit !== -1 && (
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${barCls}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 shrink-0 text-xs">
                    {remaining !== null && (
                      <span className={`w-24 text-right font-medium ${numCls}`}>
                        {remaining.toLocaleString()} remaining
                      </span>
                    )}
                    <span className="w-16 text-right text-content-secondary">
                      {l.used.toLocaleString()} /{" "}
                      {l.limit === -1 ? "∞" : l.limit.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          {(isPayg || activeTab === "history") && (
            <TabsTrigger value="history">History</TabsTrigger>
          )}
        </TabsList>

        {/* Plans */}
        <TabsContent value="plans" className="mt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isCurrent = plan.name === planName;
              return (
                <div
                  key={plan.name}
                  className={`relative rounded-xl border p-5 flex flex-col ${
                    isCurrent
                      ? "border-primary bg-primary/5"
                      : "border-border/60 bg-card hover:border-border transition-colors"
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute -top-2.5 left-4 text-[10px] font-bold bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                      Current
                    </span>
                  )}
                  <div className="mb-3">
                    <p className="font-semibold text-content">
                      {plan.displayName}
                    </p>
                    <div className="flex flex-col gap-0.5 mt-1">
                      {(() => {
                        const cardPrice = planCardPrice(plan);
                        return (
                          <>
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-bold text-content">
                                {cardPrice.headline}
                              </span>
                              {!plan.isPayg && plan.monthlyPrice > 0 && (
                                <span className="text-xs text-content-secondary">
                                  /mo
                                </span>
                              )}
                            </div>
                            {cardPrice.sub && (
                              <span className="text-[11px] text-success font-medium">
                                {cardPrice.sub}
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <ul className="space-y-1.5 flex-1 mb-4">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-xs text-content-secondary"
                      >
                        <Check className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <p className="text-xs text-primary font-medium flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Active
                    </p>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full gap-1"
                      onClick={() => setUpgradeTarget(plan)}
                    >
                      {plan.isPayg
                        ? "Switch to Pay-as-you-go"
                        : `Upgrade to ${plan.displayName}`}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="mt-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-content-secondary">
              Credit transaction history
            </p>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => setTopUpOpen(true)}
            >
              <Zap className="h-3.5 w-3.5" /> Add funds
            </Button>
          </div>
          {txPage && txPage.items.length > 0 ? (
            <div className="rounded-xl border border-border/60 divide-y divide-border/40 overflow-hidden">
              {txPage.items.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between px-5 py-3.5 bg-card hover:bg-muted/20 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-content">
                      {TX_LABEL[tx.type] ?? tx.type}
                    </p>
                    <p className="text-xs text-content-secondary mt-0.5">
                      {tx.description ?? tx.channel ?? "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${TX_COLOR[tx.type] ?? "text-content"}`}
                    >
                      {TX_SIGN[tx.type] ?? ""}${Math.abs(tx.amount).toFixed(4)}
                    </p>
                    <p className="text-xs text-content-secondary mt-0.5">
                      {new Date(tx.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border/60 bg-card p-10 flex flex-col items-center gap-3 text-center">
              <CreditCard className="h-7 w-7 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-content">
                  No transactions yet
                </p>
                <p className="text-xs text-content-secondary mt-0.5">
                  Add funds to see your history here
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setTopUpOpen(true)}
                className="gap-1.5 mt-1"
              >
                <Zap className="h-3.5 w-3.5" /> Add funds
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Dialogs ─────────────────────────────────────────────────────── */}
      {accountId && (
        <>
          <TopUpDialog
            open={topUpOpen}
            onClose={() => setTopUpOpen(false)}
            accountId={accountId}
            currentBalance={balAmt}
            customerEmail={customerEmail}
          />
          {upgradeTarget && (
            <PlanUpgradeDialog
              open={!!upgradeTarget}
              onClose={() => setUpgradeTarget(null)}
              onSuccess={handleUpgradeSuccess}
              plan={upgradeTarget}
              accountId={accountId}
              customerEmail={customerEmail}
              currentPlan={planName}
            />
          )}
        </>
      )}
    </div>
  );
}
