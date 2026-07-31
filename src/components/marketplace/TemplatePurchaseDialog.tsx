/**
 * TemplatePurchaseDialog
 *
 * Shown when a user clicks "Install" on a paid marketplace template.
 * Flow:
 *   1. Confirm step — shows price + app selector
 *   2. Method step  — choose payment method (card or mobile)
 *   3. Card/Mobile step — PesaPal card redirect or mobile money
 *   4. Success step — template installed
 *
 * After payment.succeeded, afrisinc-pay fires the internal webhook which
 * calls marketplaceService.installTemplate(templateId, appId, ...).
 */
import { useState, useEffect } from "react";
import { CardPaymentStep } from "@/components/payment/CardPaymentStep";
import { PaymentMethodSelector } from "@/components/payment/PaymentMethodSelector";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  ArrowLeft,
  Loader2,
  Sparkles,
  AlertCircle,
  Package,
  Smartphone,
} from "lucide-react";
import { useMobilePaymentConfirmation } from "@/hooks/usePayg";
import { useCardPayment, useMobilePayment } from "@/hooks/usePayment";
import { useExchangeRate } from "@/lib/exchangeRate";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AppOption {
  id: string;
  name: string;
  environment?: string;
}

export interface TemplatePurchaseDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called when template is successfully paid and queued for install */
  onSuccess?: () => void;
  template: {
    id: string;
    name?: string;
    subject?: string;
    price?: number;
    features?: string[];
  } | null;
  apps: AppOption[];
  accountId: string;
  customerEmail: string;
}

type Step = "confirm" | "method" | "card" | "mobile" | "pending" | "success";
type PaymentMethod = "card" | "mobile";

// ─── Mobile step ───────────────────────────────────────────────────────────────

interface MobileStepProps {
  templateName: string;
  templateId: string;
  appId: string;
  amountUSD: number;
  accountId: string;
  exchangeRate: number;
  onBack: () => void;
  onSuccess: (paymentRef: string) => void;
}

function MobileStep({
  templateName,
  templateId,
  appId,
  amountUSD,
  accountId,
  exchangeRate,
  onBack,
  onSuccess,
}: MobileStepProps) {
  const { initMobilePayment } = useMobilePayment(accountId);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const rwfAmount = Math.round(amountUSD * exchangeRate);

  async function handlePay() {
    if (!phoneNumber.trim()) {
      setError("Phone number is required");
      return;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length !== 9 || !cleanPhone.startsWith("7")) {
      setError("Enter a valid 9-digit number starting with 7");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const result = await initMobilePayment({
        type: "template_purchase",
        templateId,
        appId,
        phoneNumber: `250${cleanPhone}`,
        customerName: templateName,
      });

      onSuccess(result.paymentRef);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to initiate payment";
      setError(msg);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Order summary */}
      <div className="rounded-lg border border-border/60 divide-y divide-border/40 overflow-hidden text-sm">
        <div className="flex justify-between px-3 py-2 bg-muted/30 dark:bg-muted/20">
          <span className="text-content-secondary dark:text-foreground/70">
            Template purchase
          </span>
          <span className="font-semibold text-content dark:text-foreground">
            ${amountUSD.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between px-3 py-2 bg-muted/30 dark:bg-muted/20">
          <span className="text-content-secondary dark:text-foreground/70">
            Amount (RWF)
          </span>
          <span className="font-semibold text-content dark:text-foreground">
            {rwfAmount.toLocaleString()} RWF
          </span>
        </div>
        <div className="flex justify-between px-3 py-2.5 bg-primary/5 dark:bg-primary/10">
          <span className="font-semibold text-content dark:text-foreground">
            Charged today (one-time)
          </span>
          <span className="font-bold text-primary">
            {rwfAmount.toLocaleString()} RWF
          </span>
        </div>
      </div>

      {/* Phone input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-foreground">
              Mobile Money
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            MTN MoMo or Airtel Money
          </span>
        </div>

        <div>
          <Label htmlFor="phone" className="text-sm font-medium">
            Phone Number
          </Label>
          <div className="mt-1.5 flex">
            <div className="flex items-center gap-1.5 px-3 border border-r-0 border-input rounded-l-md bg-muted/50 text-sm text-muted-foreground">
              <span className="text-base">🇷🇼</span>
              <span>+250</span>
            </div>
            <Input
              id="phone"
              type="tel"
              placeholder="78 123 4567"
              className="rounded-l-none"
              value={phoneNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setPhoneNumber(value);
                setError("");
              }}
              disabled={processing}
              maxLength={9}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          disabled={processing}
          className="gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Button>
        <Button
          className="flex-1"
          disabled={processing || !phoneNumber.trim()}
          onClick={handlePay}
        >
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Initiating…
            </>
          ) : (
            `Pay ${rwfAmount.toLocaleString()} RWF`
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Pending step ──────────────────────────────────────────────────────────────

interface PendingStepProps {
  accountId: string;
  paymentRef: string;
  templateName: string;
  onSuccess: () => void;
  onFailed: () => void;
}

function PendingStep({
  accountId,
  paymentRef,
  templateName,
  onSuccess,
  onFailed,
}: PendingStepProps) {
  const { confirmed, failed, timedOut } = useMobilePaymentConfirmation(
    accountId,
    paymentRef,
    null,
  );

  useEffect(() => {
    if (confirmed) onSuccess();
    if (failed) onFailed();
  }, [confirmed, failed, onSuccess, onFailed]);

  return (
    <div className="space-y-5 text-center py-4">
      <div className="flex justify-center">
        {confirmed ? (
          <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle className="h-7 w-7 text-success" />
          </div>
        ) : failed ? (
          <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
        ) : timedOut ? (
          <div className="h-14 w-14 rounded-full bg-warning/10 flex items-center justify-center">
            <AlertCircle className="h-7 w-7 text-warning" />
          </div>
        ) : (
          <div className="h-14 w-14 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <Loader2 className="h-7 w-7 text-yellow-600 animate-spin" />
          </div>
        )}
      </div>

      <div>
        {confirmed ? (
          <>
            <p className="font-semibold text-lg">Payment Successful!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Installing template...
            </p>
          </>
        ) : failed ? (
          <>
            <p className="font-semibold text-lg text-destructive">
              Payment Failed
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              The payment was not completed. Please try again.
            </p>
          </>
        ) : timedOut ? (
          <>
            <p className="font-semibold text-lg text-warning">
              Payment Taking Too Long
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              We haven't received confirmation yet. Please check your phone for
              a pending prompt, or ensure you have sufficient balance and try
              again.
            </p>
          </>
        ) : (
          <>
            <p className="font-semibold text-lg">Check your phone</p>
            <p className="text-sm text-muted-foreground mt-1">
              A payment prompt has been sent to your phone. Please enter your
              PIN to confirm the payment.
            </p>
            <div className="mt-3 flex justify-center">
              <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-yellow-500 rounded-full animate-pulse w-full" />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        <p>"{templateName}"</p>
      </div>

      {(failed || timedOut) && (
        <Button variant="outline" onClick={onFailed} className="w-full">
          Try Again
        </Button>
      )}
    </div>
  );
}

// ─── Main dialog ───────────────────────────────────────────────────────────────

export function TemplatePurchaseDialog({
  open,
  onClose,
  onSuccess,
  template,
  apps,
  accountId,
  customerEmail,
}: TemplatePurchaseDialogProps) {
  const [step, setStep] = useState<Step>("confirm");
  const [selectedAppId, setSelectedAppId] = useState(apps[0]?.id ?? "");
  const [mobilePaymentRef, setMobilePaymentRef] = useState<string | null>(null);

  const { data: exchangeRate } = useExchangeRate();
  const { initCardPayment } = useCardPayment(accountId);

  const templateName = template?.subject || template?.name || "Template";
  const price = template?.price ?? 0;

  function handleClose() {
    setStep("confirm");
    setPaymentMethod("card");
    setMobilePaymentRef(null);
    onClose();
    if (step === "success") onSuccess?.();
  }

  function handleSuccess() {
    setStep("success");
  }

  function handleMobileSuccess(paymentRef: string) {
    setMobilePaymentRef(paymentRef);
    setStep("pending");
  }

  function handleMobilePaymentFailed() {
    setMobilePaymentRef(null);
    setStep("mobile");
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-primary/50 rounded-full mt-0.5" />
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-foreground">
                {step === "confirm" && `Purchase "${templateName}"`}
                {step === "method" && "Choose Payment Method"}
                {step === "card" && "Card Payment"}
                {step === "mobile" && "Mobile Money"}
                {step === "pending" && "Waiting for Payment"}
                {step === "success" && "Purchase Complete!"}
              </DialogTitle>
              <DialogDescription className="text-xs text-content-secondary mt-0.5">
                {step === "confirm" && "One-time purchase — yours forever"}
                {step === "method" && "Select how you'd like to pay"}
                {step === "card" && "Your card details are encrypted by Stripe"}
                {step === "mobile" && "Pay with MTN MoMo or Airtel Money"}
                {step === "pending" && "Check your phone for payment prompt"}
                {step === "success" &&
                  "Your template has been installed to your app"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ── Step 1: Confirm ─────────────────────────────────────────────── */}
        {step === "confirm" && (
          <div className="space-y-5">
            {/* Price badge */}
            <Alert className="bg-primary/8 border-primary/30 rounded-xl">
              <Package className="h-4 w-4 text-primary" />
              <AlertDescription className="text-content font-medium">
                Premium template ·{" "}
                <span className="font-bold text-primary text-lg">
                  ${price.toFixed(2)}
                </span>{" "}
                one-time
              </AlertDescription>
            </Alert>

            {/* App selector */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-content-secondary uppercase tracking-wider">
                Install into
              </p>
              {apps.length === 0 ? (
                <Alert variant="destructive" className="rounded-xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Create an app first, then purchase templates.
                  </AlertDescription>
                </Alert>
              ) : (
                <Select value={selectedAppId} onValueChange={setSelectedAppId}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Choose an app…" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {apps.map((app) => (
                      <SelectItem key={app.id} value={app.id} className="py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span className="font-medium">{app.name}</span>
                          {app.environment && (
                            <span className="text-xs text-content-secondary dark:text-foreground/70">
                              ({app.environment})
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Features */}
            {template?.features && template.features.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-content-secondary dark:text-foreground/70 uppercase tracking-wider">
                  What's included
                </p>
                <div className="bg-muted/30 dark:bg-muted/20 rounded-xl p-4 space-y-2">
                  {template.features.slice(0, 4).map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <p className="text-sm text-content-secondary dark:text-foreground/70">
                        {f}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-border/20">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={!selectedAppId || apps.length === 0}
                onClick={() => setStep("method")}
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Payment Method Selection ─────────────────────────────── */}
        {step === "method" && template && (
          <PaymentMethodSelector
            chargeAmount={price}
            onSelectCard={() => setStep("card")}
            onSelectMobile={() => setStep("mobile")}
            onBack={() => setStep("confirm")}
            summaryItems={[
              { label: "Template", value: templateName },
              {
                label: "Total",
                value: price,
                highlight: true,
                color: "primary" as const,
              },
            ]}
          />
        )}

        {/* ── Step 3a: Card (PesaPal Redirect) ──────────────────────────────── */}
        {step === "card" && template && (
          <CardPaymentStep
            chargeAmount={price}
            accountId={accountId}
            customerEmail={customerEmail}
            onInitPayment={(email) =>
              initCardPayment({
                type: "template_purchase",
                templateId: template.id,
                appId: selectedAppId,
                email,
              })
            }
            onSuccess={handleSuccess}
            onBack={() => setStep("method")}
            storageKeyPrefix="template_purchase_pcode"
            summaryItems={[
              { label: "Template", value: templateName },
              {
                label: "One-time charge",
                value: price,
                highlight: true,
                color: "primary" as const,
              },
            ]}
          />
        )}

        {/* ── Step 3b: Mobile Money ───────────────────────────────────────── */}
        {step === "mobile" && template && (
          <MobileStep
            templateName={templateName}
            templateId={template.id}
            appId={selectedAppId}
            amountUSD={price}
            accountId={accountId}
            exchangeRate={exchangeRate}
            onBack={() => setStep("method")}
            onSuccess={handleMobileSuccess}
          />
        )}

        {/* ── Step 4: Pending (Mobile Payment Confirmation) ───────────────── */}
        {step === "pending" && template && mobilePaymentRef && (
          <PendingStep
            accountId={accountId}
            paymentRef={mobilePaymentRef}
            templateName={templateName}
            onSuccess={handleSuccess}
            onFailed={handleMobilePaymentFailed}
          />
        )}

        {/* ── Step 3: Success ──────────────────────────────────────────────── */}
        {step === "success" && (
          <div className="space-y-5 text-center">
            <div className="flex justify-center">
              <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-success" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-content text-lg">
                Template purchased!
              </p>
              <p className="text-sm text-content-secondary mt-1">
                <span className="font-medium">"{templateName}"</span> is being
                installed. It will appear in your app's templates shortly.
              </p>
            </div>
            <Alert className="bg-success/8 border-success/30 rounded-xl text-left">
              <Sparkles className="h-4 w-4 text-success" />
              <AlertDescription className="text-sm text-content">
                Your template is being activated by our system. This usually
                takes a few seconds.
              </AlertDescription>
            </Alert>
            <Button className="w-full" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
