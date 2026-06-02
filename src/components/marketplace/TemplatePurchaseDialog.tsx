/**
 * TemplatePurchaseDialog
 *
 * Shown when a user clicks "Install" on a paid marketplace template.
 * Flow:
 *   1. Confirm step — shows price + app selector
 *   2. Card step    — Stripe CardElement (inside <Elements>)
 *   3. Success step — template installed
 *
 * After payment.succeeded, afrisinc-pay fires the internal webhook which
 * calls marketplaceService.installTemplate(templateId, appId, ...).
 */
import { useState } from "react";
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { StripeCardInput } from "@/components/payment/StripeCardInput";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { useInitTemplatePurchase } from "@/hooks/useMarketplace";

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

type Step = "confirm" | "card" | "success";

// ─── Card step (inside <Elements>) ────────────────────────────────────────────

interface CardStepProps {
  templateId: string;
  appId: string;
  amountUSD: number;
  accountId: string;
  customerEmail: string;
  onBack: () => void;
  onSuccess: () => void;
}

function CardStep({
  templateId,
  appId,
  amountUSD,
  accountId,
  customerEmail,
  onBack,
  onSuccess,
}: CardStepProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { mutateAsync: initPayment } = useInitTemplatePurchase(
    templateId,
    accountId,
  );

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  async function handlePay() {
    if (!stripe || !elements) return;
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setProcessing(true);
    setError("");

    try {
      const { clientSecret } = await initPayment({ appId, customerEmail });

      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: { email: customerEmail },
          },
        });

      if (stripeError) {
        setError(stripeError.message ?? "Payment failed. Please try again.");
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        onSuccess();
      } else {
        setError("Payment was not completed. Please try again.");
      }
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Payment failed. Please try again.",
      );
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Order summary */}
      <div className="rounded-lg border border-border/60 divide-y divide-border/40 overflow-hidden text-sm">
        <div className="flex justify-between px-3 py-2 bg-muted/30">
          <span className="text-content-secondary">Template purchase</span>
          <span className="font-semibold text-content">
            ${amountUSD.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between px-3 py-2.5 bg-primary/5">
          <span className="font-semibold text-content">
            Charged today (one-time)
          </span>
          <span className="font-bold text-primary">
            ${amountUSD.toFixed(2)}
          </span>
        </div>
      </div>

      <StripeCardInput
        error={error}
        onChange={() => setError("")}
        disabled={processing}
      />

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
          disabled={!stripe || processing}
          onClick={handlePay}
        >
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing…
            </>
          ) : (
            `Pay $${amountUSD.toFixed(2)}`
          )}
        </Button>
      </div>
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

  const templateName = template?.subject || template?.name || "Template";
  const price = template?.price ?? 0;

  function handleClose() {
    setStep("confirm");
    onClose();
    if (step === "success") onSuccess?.();
  }

  function handleSuccess() {
    setStep("success");
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-primary/50 rounded-full mt-0.5" />
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-content">
                {step === "confirm" && `Purchase "${templateName}"`}
                {step === "card" && "Payment Details"}
                {step === "success" && "Purchase Complete!"}
              </DialogTitle>
              <DialogDescription className="text-xs text-content-secondary mt-0.5">
                {step === "confirm" && "One-time purchase — yours forever"}
                {step === "card" && "Your card details are encrypted by Stripe"}
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
                            <span className="text-xs text-muted-foreground">
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
                <p className="text-xs font-bold text-content-secondary uppercase tracking-wider">
                  What's included
                </p>
                <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                  {template.features.slice(0, 4).map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <p className="text-sm text-content-secondary">{f}</p>
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
                onClick={() => setStep("card")}
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Card (Stripe Elements) ──────────────────────────────── */}
        {step === "card" && template && (
          <Elements stripe={stripePromise}>
            <CardStep
              templateId={template.id}
              appId={selectedAppId}
              amountUSD={price}
              accountId={accountId}
              customerEmail={customerEmail}
              onBack={() => setStep("confirm")}
              onSuccess={handleSuccess}
            />
          </Elements>
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
