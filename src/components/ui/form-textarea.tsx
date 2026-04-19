import React from "react";
import { cn } from "@/lib/utils";

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
  fullWidth?: boolean;
}

const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      label,
      description,
      error,
      helperText,
      required,
      maxLength,
      showCharCount = false,
      fullWidth = true,
      className,
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const charCount = typeof value === "string" ? value.length : 0;

    return (
      <div className={cn("space-y-2.5", !fullWidth && "w-fit")}>
        {/* Label Section */}
        {label && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-content-secondary dark:text-foreground/70 uppercase tracking-widest flex items-center gap-1.5">
              {label}
              {required && <span className="text-destructive">*</span>}
            </label>
            {description && (
              <p className="text-xs text-content-secondary dark:text-foreground/60 font-normal normal-case">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Textarea Wrapper */}
        <div className="space-y-2">
          <textarea
            ref={ref}
            disabled={disabled}
            maxLength={maxLength}
            value={value}
            className={cn(
              // Base styling
              "w-full rounded-xl border border-border/40 dark:border-border/50 bg-card dark:bg-slate-800 text-content dark:text-white placeholder:text-content-secondary dark:placeholder:text-foreground/50",
              // Padding
              "px-4 py-3",
              // Focus state
              "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all",
              // Disabled state
              disabled && "opacity-50 cursor-not-allowed bg-muted dark:bg-slate-800/50",
              // Error state
              error && "border-destructive/50 dark:border-destructive/50 focus:ring-destructive/40 focus:border-destructive/50",
              // Text styling
              "text-base resize-none",
              className
            )}
            {...props}
          />

          {/* Character Count & Helper Text */}
          <div className="flex items-center justify-between">
            <div>
              {error && (
                <p className="text-xs text-destructive dark:text-destructive/90 font-medium">
                  {error}
                </p>
              )}
              {!error && helperText && (
                <p className="text-xs text-content-secondary dark:text-foreground/60">
                  {helperText}
                </p>
              )}
            </div>

            {showCharCount && maxLength && (
              <p className={cn(
                "text-xs font-medium",
                charCount >= maxLength * 0.9
                  ? "text-warning dark:text-warning/90"
                  : "text-content-secondary dark:text-foreground/60"
              )}>
                {charCount}/{maxLength}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

FormTextarea.displayName = "FormTextarea";

export { FormTextarea };
export type { FormTextareaProps };
