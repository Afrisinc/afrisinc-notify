import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button, ButtonProps } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

export type ConfirmDialogVariant = "danger" | "warning" | "info" | "success";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  message?: string;
  variant?: ConfirmDialogVariant;
  items?: string[];
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  confirmVariant?: ButtonProps["variant"];
}

const variantConfig: Record<
  ConfirmDialogVariant,
  {
    icon: React.ReactNode;
    bgColor: string;
    borderColor: string;
    textColor: string;
    buttonVariant: ButtonProps["variant"];
  }
> = {
  danger: {
    icon: <AlertCircle className="h-5 w-5" />,
    bgColor: "bg-destructive/10 dark:bg-destructive/15",
    borderColor: "border-destructive/30 dark:border-destructive/40",
    textColor: "text-destructive dark:text-destructive/90",
    buttonVariant: "destructive",
  },
  warning: {
    icon: <AlertCircle className="h-5 w-5" />,
    bgColor: "bg-warning/10 dark:bg-warning/15",
    borderColor: "border-warning/30 dark:border-warning/40",
    textColor: "text-warning dark:text-warning/90",
    buttonVariant: "outline",
  },
  info: {
    icon: <Info className="h-5 w-5" />,
    bgColor: "bg-primary/10 dark:bg-primary/15",
    borderColor: "border-primary/30 dark:border-primary/40",
    textColor: "text-primary dark:text-primary/90",
    buttonVariant: "default",
  },
  success: {
    icon: <CheckCircle2 className="h-5 w-5" />,
    bgColor: "bg-success/10 dark:bg-success/15",
    borderColor: "border-success/30 dark:border-success/40",
    textColor: "text-success dark:text-success/90",
    buttonVariant: "default",
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  message,
  variant = "info",
  items,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
  disabled = false,
  confirmVariant,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const buttonVariant = confirmVariant || config.buttonVariant;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-surface dark:bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-content dark:text-foreground">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-content-secondary dark:text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Alert Box */}
          <div
            className={`border rounded-lg p-4 space-y-3 ${config.bgColor} ${config.borderColor}`}
          >
            <div className={`flex gap-3 ${config.textColor}`}>
              <div className="mt-0.5 shrink-0">{config.icon}</div>
              <div className="space-y-2">
                {message && (
                  <p className="font-medium text-sm leading-snug">{message}</p>
                )}
                {items && items.length > 0 && (
                  <ul className="text-xs space-y-1 ml-1">
                    {items.map((item, idx) => (
                      <li key={idx}>• {item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading || disabled}
            className="text-content-secondary dark:text-muted-foreground dark:border-border dark:hover:bg-primary/10"
          >
            {cancelText}
          </Button>
          <Button
            variant={buttonVariant}
            onClick={handleConfirm}
            disabled={isLoading || disabled}
            className={
              buttonVariant === "destructive"
                ? "dark:bg-destructive dark:text-white dark:hover:bg-destructive/90"
                : ""
            }
          >
            {isLoading ? `${confirmText}...` : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
