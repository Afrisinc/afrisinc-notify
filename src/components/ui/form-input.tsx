import React from "react";
import { cn } from "@/lib/utils";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      description,
      error,
      icon,
      iconPosition = "left",
      helperText,
      required,
      fullWidth = true,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
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

        {/* Input Wrapper */}
        <div className="relative group">
          {/* Left Icon */}
          {icon && iconPosition === "left" && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-content-secondary dark:text-foreground/60 transition-colors group-focus-within:text-primary flex-shrink-0 pointer-events-none">
              {icon}
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            disabled={disabled}
            className={cn(
              // Base styling
              "h-11 w-full rounded-xl border border-border/40 dark:border-border/50 bg-card dark:bg-slate-800 text-content dark:text-white placeholder:text-content-secondary dark:placeholder:text-foreground/50",
              // Padding based on icon position
              icon && iconPosition === "left" ? "pl-12 pr-4" : "px-4",
              icon && iconPosition === "right" ? "pr-12" : "",
              // Focus state
              "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all",
              // Disabled state
              disabled && "opacity-50 cursor-not-allowed bg-muted dark:bg-slate-800/50",
              // Error state
              error && "border-destructive/50 dark:border-destructive/50 focus:ring-destructive/40 focus:border-destructive/50",
              // Text styling
              "text-base",
              className
            )}
            {...props}
          />

          {/* Right Icon */}
          {icon && iconPosition === "right" && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-content-secondary dark:text-foreground/60 transition-colors group-focus-within:text-primary flex-shrink-0 pointer-events-none">
              {icon}
            </div>
          )}
        </div>

        {/* Error/Helper Text */}
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
    );
  }
);

FormInput.displayName = "FormInput";

export { FormInput };
export type { FormInputProps };
