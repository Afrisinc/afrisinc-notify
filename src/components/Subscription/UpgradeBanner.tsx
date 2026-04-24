import { useUpgradeRecommendations } from '@/hooks/useSubscription';
import { useOrg } from '@/contexts/OrgContext';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function UpgradeBanner() {
  const { currentOrg } = useOrg();
  const { getAccountIdForOrg } = useUser();
  const accountId = currentOrg ? getAccountIdForOrg(currentOrg.id) : undefined;
  const { data, isLoading } = useUpgradeRecommendations(accountId ?? undefined);
  const navigate = useNavigate();

  if (isLoading || !data || !data.needsUpgrade || !data.recommendedPlan) {
    return null;
  }

  const { currentPlan, limitedMetrics, recommendedPlan } = data;

  return (
    // "relative" added so the absolute overlay div is scoped inside the card
    // and doesn't bleed out to cover sibling elements like tab triggers
    <Card className="relative border-warning/30 bg-gradient-to-r from-warning/10 via-warning/5 to-transparent overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-warning/5 to-transparent opacity-50" />
      <CardHeader className="relative pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <CardTitle className="text-base text-warning">Upgrade Recommended</CardTitle>
              <p className="text-sm text-content-secondary mt-1">
                Your {currentPlan} plan is approaching its limits
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Limited Metrics */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-content-secondary uppercase">Limited Metrics</p>
          <div className="flex flex-wrap gap-2">
            {limitedMetrics.map((metric) => (
              <div
                key={metric.metric}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning/15 text-warning text-xs"
              >
                <TrendingUp className="h-3 w-3" />
                {metric.metric}: {metric.percentage.toFixed(0)}%
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Plan Card */}
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
          <div>
            <p className="font-semibold text-content">{recommendedPlan.name} Plan</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-primary">${recommendedPlan.priceMonthly}</span>
              <span className="text-xs text-content-secondary">/month (${recommendedPlan.priceYearly}/year)</span>
            </div>
          </div>

          {/* Key Improvements */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-content-secondary uppercase">Key Improvements</p>
            <div className="space-y-1">
              {recommendedPlan.improvements.slice(0, 3).map((improvement) => {
                const formatLimit = (value: number | string) => {
                  if (value === -1) return 'Unlimited';
                  if (value === 0) return 'Not included';
                  if (value === 1) return 'Included';
                  if (typeof value === 'number') return value.toLocaleString();
                  return value;
                };

                return (
                  <div key={improvement.metric} className="flex items-center justify-between text-xs">
                    <span className="text-content-secondary capitalize">
                      {improvement.metric.replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-content-secondary">{formatLimit(improvement.current)}</span>
                      <ArrowRight className="h-3 w-3 text-primary" />
                      <span className="font-semibold text-success">{formatLimit(improvement.upgraded)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => navigate('/dashboard/billing')}
            className="w-full h-9 bg-primary hover:bg-primary/90"
            size="sm"
          >
            Upgrade to {recommendedPlan.name}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-content-secondary">
          💡 Tip: Your limits reset at the beginning of next month. Upgrade now to access more features.
        </p>
      </CardContent>
    </Card>
  );
}