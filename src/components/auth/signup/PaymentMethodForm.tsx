import { useState, forwardRef, useImperativeHandle } from "react";
import { CreditCard, Lock, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface PaymentMethodFormRef {
  validate: () => boolean;
  getPaymentData: () => PaymentData | null;
}

export interface PaymentData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  cardholderName: string;
}

interface PaymentMethodFormProps {
  onValidChange?: (isValid: boolean) => void;
  disabled?: boolean;
}

const PaymentMethodForm = forwardRef<
  PaymentMethodFormRef,
  PaymentMethodFormProps
>(({ onValidChange, disabled = false }, ref) => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  };

  const validateCard = () => {
    const newErrors: Record<string, string> = {};

    if (!cardholderName.trim()) {
      newErrors.cardholderName = "Cardholder name is required";
    }

    const cardDigits = cardNumber.replace(/\s/g, "");
    if (cardDigits.length < 13 || cardDigits.length > 16) {
      newErrors.cardNumber = "Enter a valid card number";
    }

    const [month, year] = expiry.split("/");
    const monthNum = Number.parseInt(month, 10);
    if (!month || !year || monthNum < 1 || monthNum > 12 || year.length !== 2) {
      newErrors.expiry = "Enter a valid expiry date (MM/YY)";
    } else {
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      const yearNum = Number.parseInt(year, 10);
      if (
        yearNum < currentYear ||
        (yearNum === currentYear && monthNum < currentMonth)
      ) {
        newErrors.expiry = "Card has expired";
      }
    }

    if (cvc.length < 3 || cvc.length > 4) {
      newErrors.cvc = "Enter a valid CVC";
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    onValidChange?.(isValid);
    return isValid;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateCard();
  };

  useImperativeHandle(ref, () => ({
    validate: validateCard,
    getPaymentData: () => {
      if (!validateCard()) return null;
      const [month, year] = expiry.split("/");
      return {
        cardNumber: cardNumber.replace(/\s/g, ""),
        expiryMonth: month,
        expiryYear: `20${year}`,
        cvc,
        cardholderName,
      };
    },
  }));

  const getCardBrand = () => {
    const digits = cardNumber.replace(/\s/g, "");
    if (digits.startsWith("4")) return "Visa";
    if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return "Mastercard";
    if (digits.startsWith("37") || digits.startsWith("34")) return "Amex";
    if (digits.startsWith("6")) return "Discover";
    return null;
  };

  const cardBrand = getCardBrand();

  const inputErrorClass =
    "border-destructive focus-visible:ring-destructive/20";

  return (
    <div className="space-y-4">
      {/* Card header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Payment method
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" />
          <span>Secure</span>
        </div>
      </div>

      {/* Cardholder name */}
      <div className="space-y-2">
        <label htmlFor="cardholderName" className="form-label">
          Cardholder name
        </label>
        <Input
          id="cardholderName"
          type="text"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          onBlur={() => handleBlur("cardholderName")}
          placeholder="Name on card"
          disabled={disabled}
          className={cn(
            touched.cardholderName && errors.cardholderName && inputErrorClass,
          )}
        />
        {touched.cardholderName && errors.cardholderName && (
          <p className="form-error flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.cardholderName}
          </p>
        )}
      </div>

      {/* Card number */}
      <div className="space-y-2">
        <label htmlFor="cardNumber" className="form-label">
          Card number
        </label>
        <div className="relative">
          <Input
            id="cardNumber"
            type="text"
            inputMode="numeric"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            onBlur={() => handleBlur("cardNumber")}
            placeholder="1234 5678 9012 3456"
            disabled={disabled}
            className={cn(
              "pr-16",
              touched.cardNumber && errors.cardNumber && inputErrorClass,
            )}
          />
          {cardBrand && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {cardBrand}
            </span>
          )}
        </div>
        {touched.cardNumber && errors.cardNumber && (
          <p className="form-error flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.cardNumber}
          </p>
        )}
      </div>

      {/* Expiry and CVC row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label htmlFor="expiry" className="form-label">
            Expiry date
          </label>
          <Input
            id="expiry"
            type="text"
            inputMode="numeric"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            onBlur={() => handleBlur("expiry")}
            placeholder="MM/YY"
            disabled={disabled}
            className={cn(touched.expiry && errors.expiry && inputErrorClass)}
          />
          {touched.expiry && errors.expiry && (
            <p className="form-error flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.expiry}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="cvc" className="form-label">
            CVC
          </label>
          <Input
            id="cvc"
            type="text"
            inputMode="numeric"
            value={cvc}
            onChange={(e) =>
              setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            onBlur={() => handleBlur("cvc")}
            placeholder="123"
            disabled={disabled}
            className={cn(touched.cvc && errors.cvc && inputErrorClass)}
          />
          {touched.cvc && errors.cvc && (
            <p className="form-error flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.cvc}
            </p>
          )}
        </div>
      </div>

      {/* Security note */}
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Lock className="h-3 w-3" />
        Your payment info is encrypted and secure. We never store your full card
        number.
      </p>
    </div>
  );
});

PaymentMethodForm.displayName = "PaymentMethodForm";

export default PaymentMethodForm;
