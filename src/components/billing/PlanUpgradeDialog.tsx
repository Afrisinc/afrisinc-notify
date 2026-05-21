import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, CheckCircle, CreditCard, ArrowLeft, Zap } from "lucide-react";
import { useUpgradePlan } from "@/hooks/usePayg";

export interface PlanOption {
  name: string;
  displayName: string;
  monthlyPrice: number;
  yearlyPrice: number;
  annualNote?: string;
  features: string[];
  isPayg?: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called right after dialog closes on a successful upgrade.
   *  isPayg=true → caller should open the top-up flow */
  onSuccess?: (isPayg: boolean) => void;
  plan: PlanOption;
  accountId: string;
  currentPlan?: string;
}

function formatCard(val: string) {
  return val
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(val: string) {
  const d = val.replace(/\D/g, "").slice(0, 4);
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

type Step = "confirm" | "card" | "success";

export function PlanUpgradeDialog({
  open,
  onClose,
  onSuccess,
  plan,
  accountId,
}: Props) {
  const [step, setStep] = useState<Step>("confirm");
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [card, setCard] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  });
  const [error, setError] = useState("");

  const { mutateAsync: upgrade, isPending } = useUpgradePlan(accountId);

  const price = billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  const isCardValid =
    card.number.replace(/\s/g, "").length === 16 &&
    card.expiry.length === 5 &&
    card.cvc.length >= 3 &&
    card.name.trim().length > 1;

  async function handleSubscribe() {
    setError("");
    try {
      await upgrade({ plan: plan.name, billingCycle: billing });
      setStep("success");
    } catch (e: any) {
      setError(
        e?.response?.data?.message ??
          e?.message ??
          "Something went wrong. Please try again.",
      );
    }
  }

  function reset() {
    setStep("confirm");
    setBilling("monthly");
    setCard({ number: "", expiry: "", cvc: "", name: "" });
    setError("");
  }

  function handleClose() {
    const succeeded = step === "success";
    reset();
    onClose();
    if (succeeded) onSuccess?.(!!plan.isPayg);
  }

  /** PAYG success — "Top Up Now" button */
  function handleTopUpNow() {
    reset();
    onClose();
    onSuccess?.(true);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-content">
            {step === "confirm" && `Upgrade to ${plan.displayName}`}
            {step === "card" && "Payment Details"}
            {step === "success" && "You're all set!"}
          </DialogTitle>
        </DialogHeader>

        {/* ── Step 1: Confirm ────────────────────────────────────────────── */}
        {step === "confirm" && (
          <div className="space-y-5">
            {!plan.isPayg && plan.monthlyPrice > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3">
                <span className="text-sm text-content-secondary">
                  Billing cycle
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setBilling("monthly")}
                    className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${billing === "monthly" ? "bg-primary text-primary-foreground" : "text-content-secondary hover:text-content"}`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBilling("yearly")}
                    className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${billing === "yearly" ? "bg-primary text-primary-foreground" : "text-content-secondary hover:text-content"}`}
                  >
                    Annual
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-content">
                  {plan.isPayg ? "Credits" : `$${price}`}
                </span>
                {!plan.isPayg && (
                  <span className="text-sm text-content-secondary">
                    /{billing === "monthly" ? "mo" : "yr"}
                  </span>
                )}
              </div>
              {billing === "yearly" && plan.annualNote && (
                <p className="text-xs text-success mt-1">{plan.annualNote}</p>
              )}
              {plan.isPayg && (
                <p className="text-xs text-content-secondary mt-1">
                  Pay only for what you send. No monthly commitment.
                </p>
              )}
            </div>

            <ul className="space-y-2">
              {plan.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-sm text-content"
                >
                  <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            {error && (
              <p className="text-xs text-danger bg-danger/5 border border-danger/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button
              className="w-full"
              onClick={() =>
                plan.isPayg ? handleSubscribe() : setStep("card")
              }
              disabled={isPending}
            >
              {plan.isPayg
                ? isPending
                  ? "Switching…"
                  : "Switch to Pay-as-you-go"
                : "Continue to Payment"}
            </Button>
          </div>
        )}

        {/* ── Step 2: Card ─────────────────────────────────────────────────── */}
        {step === "card" && (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/40 border border-border/50 p-3 flex justify-between text-sm">
              <span className="text-content-secondary">
                {plan.displayName} ·{" "}
                {billing === "monthly" ? "monthly" : "annual"}
              </span>
              <span className="font-semibold text-content">
                ${price}/{billing === "monthly" ? "mo" : "yr"}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs text-content-secondary mb-1.5 block">
                  Name on card
                </Label>
                <Input
                  placeholder="Jane Doe"
                  value={card.name}
                  onChange={(e) => setCard({ ...card, name: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs text-content-secondary mb-1.5 block">
                  Card number
                </Label>
                <div className="relative">
                  <Input
                    placeholder="4242 4242 4242 4242"
                    value={card.number}
                    onChange={(e) =>
                      setCard({ ...card, number: formatCard(e.target.value) })
                    }
                    maxLength={19}
                  />
                  <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-content-secondary mb-1.5 block">
                    Expiry
                  </Label>
                  <Input
                    placeholder="MM/YY"
                    value={card.expiry}
                    onChange={(e) =>
                      setCard({ ...card, expiry: formatExpiry(e.target.value) })
                    }
                    maxLength={5}
                  />
                </div>
                <div>
                  <Label className="text-xs text-content-secondary mb-1.5 block">
                    CVC
                  </Label>
                  <Input
                    placeholder="123"
                    type="password"
                    value={card.cvc}
                    onChange={(e) =>
                      setCard({
                        ...card,
                        cvc: e.target.value.replace(/\D/g, "").slice(0, 4),
                      })
                    }
                    maxLength={4}
                  />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-content-tertiary">
              🔒 Mock payment — no real charge will be made
            </p>

            {error && (
              <p className="text-xs text-danger bg-danger/5 border border-danger/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep("confirm")}
                className="gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </Button>
              <Button
                className="flex-1"
                disabled={!isCardValid || isPending}
                onClick={handleSubscribe}
              >
                {isPending
                  ? "Processing…"
                  : `Subscribe · $${price}/${billing === "monthly" ? "mo" : "yr"}`}
              </Button>
            </div>
          </div>
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
                {plan.isPayg
                  ? "Switched to Pay-as-you-go"
                  : `You're on ${plan.displayName}!`}
              </p>
              <p className="text-sm text-content-secondary mt-1">
                {plan.isPayg
                  ? "Add credits now to start sending messages."
                  : "Your plan is now active. All features are available immediately."}
              </p>
            </div>

            {plan.isPayg ? (
              <div className="flex flex-col gap-2">
                <Button className="w-full gap-1.5" onClick={handleTopUpNow}>
                  <Zap className="h-4 w-4" /> Top Up Now
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-content-secondary"
                  onClick={handleClose}
                >
                  Do it later
                </Button>
              </div>
            ) : (
              <Button className="w-full" onClick={handleClose}>
                Done
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
