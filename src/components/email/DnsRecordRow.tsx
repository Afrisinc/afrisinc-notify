import { Copy, Check, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DnsRecordRowProps {
  id: string;
  label: string;
  type: string;
  name: string;
  value: string;
  status?: "verified" | "pending" | "error" | "optional";
  onCopy: (text: string, id: string) => void;
  isCopied: boolean;
}

export function DnsRecordRow({
  id,
  label,
  type,
  name,
  value,
  status = "pending",
  onCopy,
  isCopied,
}: DnsRecordRowProps) {
  const statusConfig = {
    verified: { icon: CheckCircle2, variant: "default" as const, color: "text-success" },
    pending: { icon: Clock, variant: "secondary" as const, color: "text-warning" },
    error: { icon: AlertTriangle, variant: "destructive" as const, color: "text-destructive" },
    optional: { icon: Clock, variant: "secondary" as const, color: "text-muted-foreground" },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className="p-4 rounded-lg bg-surface border border-surface space-y-3">
      {/* Header with label and status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusIcon className={`h-4 w-4 ${config.color}`} />
          <span className="text-sm font-medium text-content">{label}</span>
        </div>
        <Badge variant={config.variant}>
          {status === "verified" ? "Verified" : status === "pending" ? "Pending" : status === "error" ? "Error" : "Optional"}
        </Badge>
      </div>

      {/* DNS Record Details */}
      <div className="space-y-2 text-sm">
        <div>
          <p className="text-content-secondary text-xs mb-1">Type</p>
          <p className="font-mono text-xs bg-content/5 px-2 py-1 rounded text-content">{type}</p>
        </div>
        <div>
          <p className="text-content-secondary text-xs mb-1">Name</p>
          <p className="font-mono text-xs bg-content/5 px-2 py-1 rounded text-content">{name}</p>
        </div>
        <div>
          <p className="text-content-secondary text-xs mb-1">Value</p>
          <div className="flex items-start gap-2">
            <p className="font-mono text-xs bg-content/5 px-2 py-1 rounded text-content flex-1 break-all">{value}</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 flex-shrink-0 mt-1"
                    onClick={() => onCopy(value, id)}
                  >
                    {isCopied ? (
                      <Check className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-content-secondary" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isCopied ? "Copied!" : "Copy"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
