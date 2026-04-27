import { Check, X } from "lucide-react";

interface PasswordStrengthMeterProps {
  password: string;
  showRequirements?: boolean;
}

const REQUIREMENTS = [
  {
    key: "length",
    label: "At least 8 characters",
    test: (p: string) => p.length >= 8,
  },
  {
    key: "upper",
    label: "One uppercase letter",
    test: (p: string) => /[A-Z]/.test(p),
  },
  {
    key: "lower",
    label: "One lowercase letter",
    test: (p: string) => /[a-z]/.test(p),
  },
  { key: "number", label: "One number", test: (p: string) => /\d/.test(p) },
  {
    key: "special",
    label: "One special character",
    test: (p: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p),
  },
];

function getStrength(password: string) {
  const met = REQUIREMENTS.filter((r) => r.test(password)).length;
  if (met === 0) return { score: 0, label: "", color: "bg-muted" };
  if (met <= 2) return { score: 25, label: "Weak", color: "bg-destructive" };
  if (met <= 3) return { score: 50, label: "Fair", color: "bg-warning" };
  if (met <= 4) return { score: 75, label: "Strong", color: "bg-success/70" };
  return { score: 100, label: "Very Strong", color: "bg-success" };
}

export function PasswordStrengthMeter({
  password,
  showRequirements = true,
}: PasswordStrengthMeterProps) {
  const { score, label, color } = getStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center justify-between">
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${color}`}
            style={{ width: `${score}%` }}
          />
        </div>
        {label && (
          <span
            className={`text-xs font-medium ml-3 ${
              score <= 25
                ? "text-destructive"
                : score <= 50
                  ? "text-warning"
                  : "text-success"
            }`}
          >
            {label}
          </span>
        )}
      </div>

      {showRequirements && (
        <ul className="space-y-1">
          {REQUIREMENTS.map((req) => {
            const met = req.test(password);
            return (
              <li key={req.key} className="flex items-center gap-2 text-xs">
                {met ? (
                  <Check className="h-3 w-3 text-success" />
                ) : (
                  <X className="h-3 w-3 text-muted-foreground/50" />
                )}
                <span
                  className={met ? "text-foreground" : "text-muted-foreground"}
                >
                  {req.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
