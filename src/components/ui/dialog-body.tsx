import { cn } from "@/lib/utils";

interface DialogBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Standardized dialog body wrapper with consistent padding and spacing.
 * Used within DialogContent to maintain visual consistency across all dialogs.
 */
export function DialogBody({ className, children, ...props }: DialogBodyProps) {
  return (
    <div className={cn("px-6 py-4 space-y-4", className)} {...props}>
      {children}
    </div>
  );
}
