import { Check, X } from "lucide-react";

interface Feature {
  name: string;
  free: boolean | string;
  payg: boolean | string;
  starter: boolean | string;
  scale: boolean | string;
  enterprise: boolean | string;
}

const DEFAULT_FEATURES: Feature[] = [
  {
    name: "Monthly commitment",
    free: "—",
    payg: "None",
    starter: "$19",
    scale: "$69",
    enterprise: "Custom",
  },
  {
    name: "Emails / month",
    free: "500",
    payg: "Pay/use",
    starter: "50,000",
    scale: "500,000",
    enterprise: "Unlimited",
  },
  {
    name: "SMS / month",
    free: "—",
    payg: "Pay/use",
    starter: "300",
    scale: "2,000",
    enterprise: "Negotiated",
  },
  {
    name: "Push subscribers",
    free: "—",
    payg: "Pay/use",
    starter: "15,000",
    scale: "Unlimited",
    enterprise: "Unlimited",
  },
  {
    name: "In-App / month",
    free: "—",
    payg: "Pay/use",
    starter: "30,000",
    scale: "Unlimited",
    enterprise: "Unlimited",
  },
  {
    name: "Apps",
    free: "1",
    payg: "1",
    starter: "3",
    scale: "10",
    enterprise: "Unlimited",
  },
  {
    name: "Contacts",
    free: "200",
    payg: "1,000",
    starter: "10,000",
    scale: "100,000",
    enterprise: "Unlimited",
  },
  {
    name: "Custom domain",
    free: false,
    payg: false,
    starter: "1",
    scale: "10",
    enterprise: "Unlimited",
  },
  {
    name: "API access",
    free: false,
    payg: true,
    starter: true,
    scale: true,
    enterprise: true,
  },
  {
    name: "Webhooks",
    free: "—",
    payg: "1",
    starter: "3",
    scale: "Unlimited",
    enterprise: "Unlimited",
  },
  {
    name: "A/B testing",
    free: false,
    payg: false,
    starter: false,
    scale: true,
    enterprise: true,
  },
  {
    name: "Advanced analytics",
    free: false,
    payg: false,
    starter: false,
    scale: true,
    enterprise: true,
  },
  {
    name: "Team members",
    free: "1",
    payg: "1",
    starter: "3",
    scale: "20",
    enterprise: "Unlimited",
  },
  {
    name: "Data retention",
    free: "30 days",
    payg: "30 days",
    starter: "60 days",
    scale: "365 days",
    enterprise: "Custom",
  },
  {
    name: "Uptime SLA",
    free: false,
    payg: false,
    starter: false,
    scale: false,
    enterprise: "99.9%",
  },
  {
    name: "Support",
    free: "Community",
    payg: "Community",
    starter: "Email 48h",
    scale: "Priority 12h",
    enterprise: "Dedicated",
  },
  {
    name: "Credits expire",
    free: "—",
    payg: "Never",
    starter: "N/A",
    scale: "N/A",
    enterprise: "N/A",
  },
];

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="h-4 w-4 text-success mx-auto" />
    ) : (
      <X className="h-4 w-4 text-muted-foreground/60 dark:text-muted-foreground/50 mx-auto" />
    );
  }
  return <span className="font-semibold text-sm text-foreground">{value}</span>;
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
            <th className="text-left font-medium text-foreground/70 dark:text-foreground/80 px-4 py-3 min-w-[160px]">
              Feature
            </th>
            <th className="text-center font-medium text-foreground/70 dark:text-foreground/80 px-4 py-3 w-[100px]">
              Free
            </th>
            <th className="text-center font-medium text-foreground/70 dark:text-foreground/80 px-4 py-3 w-[100px]">
              PAYG
            </th>
            <th className="text-center font-medium px-4 py-3 w-[100px] text-primary bg-primary/5">
              Starter $19
            </th>
            <th className="text-center font-medium text-foreground/70 dark:text-foreground/80 px-4 py-3 w-[100px]">
              Scale $69
            </th>
            <th className="text-center font-medium text-foreground/70 dark:text-foreground/80 px-4 py-3 w-[100px]">
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
              <td className="px-4 py-3 text-foreground">{f.name}</td>
              <td className="px-4 py-3 text-center">
                <CellValue value={f.free} />
              </td>
              <td className="px-4 py-3 text-center">
                <CellValue value={f.payg} />
              </td>
              <td className="px-4 py-3 text-center bg-primary/5">
                <CellValue value={f.starter} />
              </td>
              <td className="px-4 py-3 text-center">
                <CellValue value={f.scale} />
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
