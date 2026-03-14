import { forwardRef } from "react";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRY_NAMES } from "@/data/countries";

interface FormCountrySelectProps {
  label?: string;
  error?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

const FormCountrySelect = forwardRef<HTMLButtonElement, FormCountrySelectProps>(
  ({ label, error, value, onValueChange }, ref) => {
    return (
      <div className="space-y-2">
        {label && <Label className="heading-label">{label}</Label>}
        <div className="relative">
          <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger ref={ref} className="pl-9 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50">
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent className="max-h-64 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50">
              {COUNTRY_NAMES.map((country) => (
                <SelectItem key={country} value={country} className="dark:hover:bg-slate-800 dark:focus:bg-slate-800">
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

FormCountrySelect.displayName = "FormCountrySelect";

export default FormCountrySelect;
