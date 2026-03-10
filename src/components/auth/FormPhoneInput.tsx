import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone } from "lucide-react";

interface FormPhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const FormPhoneInput = forwardRef<HTMLInputElement, FormPhoneInputProps>(
  ({ label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && <Label htmlFor={id} className="heading-label">{label}</Label>}
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={ref}
            id={id}
            type="tel"
            className="pl-9 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50 dark:placeholder-slate-500"
            placeholder="+1 (555) 123-4567"
            {...props}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

FormPhoneInput.displayName = "FormPhoneInput";

export default FormPhoneInput;
