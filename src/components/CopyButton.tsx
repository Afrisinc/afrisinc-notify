import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
}

/** Small icon button that copies `value` to the clipboard, briefly showing a checkmark once copied. */
export function CopyButton({
  value,
  label = "value",
  className,
}: CopyButtonProps) {
  const { copy, isCopied } = useCopyToClipboard();

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className={cn("h-6 w-6 shrink-0", className)}
      onClick={(e) => {
        e.stopPropagation();
        copy(value, value);
      }}
      aria-label={`Copy ${label}`}
    >
      {isCopied(value) ? (
        <Check className="h-3.5 w-3.5 text-success" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}
