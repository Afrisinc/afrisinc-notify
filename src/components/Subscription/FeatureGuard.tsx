import React from "react";
import { useFeatureCheck } from "@/hooks/useSubscription";
import { useOrg } from "@/contexts/OrgContext";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export type FeatureName =
  | "custom_domain"
  | "advanced_analytics"
  | "webhooks"
  | "team_management"
  | "api_keys"
  | "sms_sending"
  | "email_scheduling";

interface FeatureGuardProps {
  feature: FeatureName;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showLock?: boolean;
}

/**
 * Feature Guard Component
 * Conditionally renders children based on plan feature availability
 * Shows upgrade prompt if feature is not available
 */
export function FeatureGuard({
  feature,
  children,
  fallback,
  showLock,
}: FeatureGuardProps) {
  const { currentOrg } = useOrg();
  const { getAccountIdForOrg } = useUser();
  const accountId = currentOrg ? getAccountIdForOrg(currentOrg.id) : undefined;
  const { available, plan, isLoading } = useFeatureCheck(
    feature,
    accountId ?? undefined,
  );
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="h-10 bg-content/5 rounded animate-pulse" />;
  }

  if (!available) {
    return (
      fallback || (
        <Card className="border-border/60 bg-content/3">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-warning flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-content capitalize">
                    {feature.replace(/_/g, " ")} is not available
                  </p>
                  <p className="text-xs text-content-secondary">
                    Upgrade your plan to unlock this feature
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate("/dashboard/billing")}
                variant="outline"
                size="sm"
                className="flex-shrink-0"
              >
                Upgrade
                <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    );
  }

  if (showLock && plan !== "ENTERPRISE") {
    return (
      <div className="relative">
        <div className="absolute top-0 right-0 inline-block px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
          {plan} Feature
        </div>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Inline feature availability indicator
 */
interface FeatureIndicatorProps {
  feature: FeatureName;
}

export function FeatureIndicator({ feature }: FeatureIndicatorProps) {
  const { available, plan } = useFeatureCheck(feature);

  if (!available) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/15 text-warning text-xs font-medium">
        <Lock className="h-3 w-3" />
        Locked
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/15 text-success text-xs font-medium">
      ✓ Available
    </span>
  );
}
