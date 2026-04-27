import { Check, X } from "lucide-react";

interface Feature {
  name: string;
  free: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
}

const DEFAULT_FEATURES: Feature[] = [
  {
    name: "Notifications / month",
    free: "100",
    pro: "10,000",
    enterprise: "Unlimited",
  },
  { name: "Templates", free: "1", pro: "Unlimited", enterprise: "Unlimited" },
  { name: "Email channel", free: true, pro: true, enterprise: true },
  { name: "SMS channel", free: false, pro: true, enterprise: true },
  { name: "Push notifications", free: false, pro: true, enterprise: true },
  { name: "In-app notifications", free: false, pro: true, enterprise: true },
  {
    name: "Log retention",
    free: "7 days",
    pro: "30 days",
    enterprise: "1 year",
  },
  { name: "Webhooks", free: false, pro: true, enterprise: true },
  { name: "Custom domain", free: false, pro: false, enterprise: true },
  { name: "API access", free: true, pro: true, enterprise: true },
  { name: "Team members", free: "1", pro: "5", enterprise: "Unlimited" },
  { name: "Priority support", free: false, pro: true, enterprise: true },
  { name: "Dedicated support", free: false, pro: false, enterprise: true },
  { name: "SLA guarantee", free: false, pro: false, enterprise: true },
  { name: "Custom integrations", free: false, pro: false, enterprise: true },
];

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="h-4 w-4 text-success mx-auto" />
    ) : (
      <X className="h-4 w-4 text-muted-foreground/60 dark:text-muted-foreground/50 mx-auto" />
    );
  }
  return (
    <span className="font-semibold text-sm text-foreground dark:text-white">
      {value}
    </span>
  );
}

export function FeatureComparisonTable({
  features = DEFAULT_FEATURES,
}: {
  features?: Feature[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left font-medium text-foreground/70 dark:text-foreground/80 px-4 py-3 min-w-[200px]">
              Feature
            </th>
            <th className="text-center font-medium text-foreground/70 dark:text-foreground/80 px-4 py-3 w-[120px]">
              Free
            </th>
            <th className="text-center font-medium px-4 py-3 w-[120px] text-primary">
              Pro
            </th>
            <th className="text-center font-medium text-foreground/70 dark:text-foreground/80 px-4 py-3 w-[120px]">
              Enterprise
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((f, i) => (
            <tr
              key={f.name}
              className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${
                i % 2 === 0 ? "" : "bg-muted/10"
              }`}
            >
              <td className="px-4 py-3 text-foreground dark:text-white">
                {f.name}
              </td>
              <td className="px-4 py-3 text-center">
                <CellValue value={f.free} />
              </td>
              <td className="px-4 py-3 text-center">
                <CellValue value={f.pro} />
              </td>
              <td className="px-4 py-3 text-center">
                <CellValue value={f.enterprise} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
