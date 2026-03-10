import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, icon, id, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && <Label htmlFor={id} className="heading-label">{label}</Label>}
        <div className="relative">
          <Input
            ref={ref}
            id={id}
            className={icon ? "pl-9 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50 dark:placeholder-slate-500" : `dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50 dark:placeholder-slate-500 ${className}`}
            {...props}
          />
          {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

export default FormInput;
