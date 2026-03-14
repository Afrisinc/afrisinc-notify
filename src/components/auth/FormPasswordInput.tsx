import { forwardRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

interface FormPasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const FormPasswordInput = forwardRef<HTMLInputElement, FormPasswordInputProps>(
  ({ label, error, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="space-y-2">
        {label && <Label htmlFor={id} className="heading-label">{label}</Label>}
        <div className="relative">
          <Input
            ref={ref}
            id={id}
            type={showPassword ? "text" : "password"}
            className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50 dark:placeholder-slate-500"
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

FormPasswordInput.displayName = "FormPasswordInput";

export default FormPasswordInput;
