import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, CreditCard, ArrowLeft, Zap, Trash2 } from "lucide-react";
import { useTopUp } from "@/hooks/usePayg";
import type { TopUpResult } from "@/services/paygService";

// ─── Saved-card helpers (mock — replace with real vault when processor added) ──

const CARD_KEY = "notify_saved_card";

interface SavedCard {
  last4: string;
  expiry: string;
  name: string;
}

function loadSavedCard(): SavedCard | null {
  try {
    const raw = localStorage.getItem(CARD_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCard(card: { number: string; expiry: string; name: string }) {
  const last4 = card.number.replace(/\s/g, "").slice(-4);
  localStorage.setItem(
    CARD_KEY,
    JSON.stringify({ last4, expiry: card.expiry, name: card.name }),
  );
}

function removeSavedCard() {
  localStorage.removeItem(CARD_KEY);
}

// ─── Amount helpers ────────────────────────────────────────────────────────────

const PRESET_AMOUNTS = [
  { value: 5, bonus: 0 },
  { value: 10, bonus: 0 },
  { value: 25, bonus: 0 },
  { value: 50, bonus: 5 },
  { value: 100, bonus: 10 },
  { value: 250, bonus: 15 },
];

function getBonusPercent(amount: number) {
  if (amount >= 250) return 15;
  if (amount >= 100) return 10;
  if (amount >= 50) return 5;
  return 0;
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

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  accountId: string;
  currentBalance: number;
}

type Step = "amount" | "card" | "success";

// ─── Component ─────────────────────────────────────────────────────────────────

export function TopUpDialog({
  open,
  onClose,
  accountId,
  currentBalance,
}: Props) {
  const [step, setStep] = useState<Step>("amount");
  const [selectedAmount, setSelectedAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState("");
  const [card, setCard] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  });
  const [saveCardChecked, setSaveCardChecked] = useState(false);
  const [useSaved, setUseSaved] = useState(true);
  const [savedCard, setSavedCard] = useState<SavedCard | null>(null);
  const [result, setResult] = useState<TopUpResult | null>(null);
  const [error, setError] = useState("");

  const { mutateAsync: topUp, isPending } = useTopUp(accountId);

  // Load saved card when dialog opens
  useEffect(() => {
    if (open) {
      const sc = loadSavedCard();
      setSavedCard(sc);
      setUseSaved(!!sc);
    }
  }, [open]);

  const amount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;
  const bonusPct = getBonusPercent(amount);
  const bonusAmt = parseFloat(((amount * bonusPct) / 100).toFixed(2));
  const totalCredits = amount + bonusAmt;
  const balanceAfter = currentBalance + totalCredits;

  const isAmountValid = amount >= 5;
  const isCardValid =
    useSaved && savedCard
      ? card.cvc.length >= 3 // only CVC needed when using saved card
      : card.number.replace(/\s/g, "").length === 16 &&
        card.expiry.length === 5 &&
        card.cvc.length >= 3 &&
        card.name.trim().length > 1;

  async function handlePay() {
    setError("");
    try {
      if (!useSaved && saveCardChecked) {
        saveCard(card);
        setSavedCard(loadSavedCard());
      }
      const res = await topUp({ amount });
      setResult(res);
      setStep("success");
    } catch (e: any) {
      setError(
        e?.response?.data?.message ?? "Payment failed. Please try again.",
      );
    }
  }

  function handleRemoveSavedCard() {
    removeSavedCard();
    setSavedCard(null);
    setUseSaved(false);
  }

  function handleClose() {
    setStep("amount");
    setSelectedAmount(25);
    setCustomAmount("");
    setCard({ number: "", expiry: "", cvc: "", name: "" });
    setSaveCardChecked(false);
    setResult(null);
    setError("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-content">
            <Zap className="h-4 w-4 text-primary" />
            {step === "amount" && "Top Up Credits"}
            {step === "card" && "Payment Details"}
            {step === "success" && "Payment Successful"}
          </DialogTitle>
        </DialogHeader>

        {/* ── Step 1: Amount ──────────────────────────────────────────────── */}
        {step === "amount" && (
          <div className="space-y-5">
            {/* Current balance pill */}
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2.5">
              <span className="text-xs text-content-secondary">
                Current balance
              </span>
              <span
                className={`text-sm font-semibold ${currentBalance === 0 ? "text-danger" : currentBalance < 5 ? "text-warning" : "text-content"}`}
              >
                ${currentBalance.toFixed(2)}
              </span>
            </div>

            {/* Preset grid */}
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map(({ value, bonus }) => (
                <button
                  key={value}
                  onClick={() => {
                    setSelectedAmount(value);
                    setCustomAmount("");
                  }}
                  className={`relative rounded-lg border p-3 text-left transition-colors ${
                    !customAmount && selectedAmount === value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-border/70 hover:bg-muted/40"
                  }`}
                >
                  <p className="font-semibold text-sm text-content">${value}</p>
                  {bonus > 0 && (
                    <span className="absolute top-1.5 right-1.5 text-[10px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded-full">
                      +{bonus}%
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <div>
              <Label className="text-xs text-content-secondary mb-1.5 block">
                Custom amount (min $5)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-content-secondary text-sm">
                  $
                </span>
                <Input
                  type="number"
                  min={5}
                  placeholder="0.00"
                  className="pl-7"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
              </div>
            </div>

            {/* Live summary — always visible once amount ≥ 5 */}
            {isAmountValid && (
              <div className="rounded-lg border border-border/60 divide-y divide-border/40 overflow-hidden text-sm">
                <div className="flex justify-between px-3 py-2 bg-muted/30">
                  <span className="text-content-secondary">Adding</span>
                  <span className="font-medium text-content">
                    ${amount.toFixed(2)}
                  </span>
                </div>
                {bonusPct > 0 && (
                  <div className="flex justify-between px-3 py-2 bg-muted/30">
                    <span className="text-success">Bonus ({bonusPct}%)</span>
                    <span className="font-medium text-success">
                      +${bonusAmt.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between px-3 py-2 bg-muted/30">
                  <span className="text-content-secondary">
                    Current balance
                  </span>
                  <span className="text-content">
                    ${currentBalance.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between px-3 py-2.5 bg-primary/5">
                  <span className="font-semibold text-content">
                    Balance after top-up
                  </span>
                  <span className="font-bold text-primary">
                    ${balanceAfter.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <Button
              className="w-full"
              disabled={!isAmountValid}
              onClick={() => setStep("card")}
            >
              Continue
            </Button>
          </div>
        )}

        {/* ── Step 2: Card ─────────────────────────────────────────────────── */}
        {step === "card" && (
          <div className="space-y-4">
            {/* Order summary */}
            <div className="rounded-lg border border-border/60 divide-y divide-border/40 overflow-hidden text-sm">
              <div className="flex justify-between px-3 py-2 bg-muted/30">
                <span className="text-content-secondary">Paying</span>
                <span className="font-semibold text-content">
                  ${amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between px-3 py-2.5 bg-primary/5">
                <span className="font-semibold text-content">
                  Balance after
                </span>
                <span className="font-bold text-primary">
                  ${balanceAfter.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Saved card toggle */}
            {savedCard && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-content-secondary">
                    Saved card
                  </p>
                  <button
                    onClick={handleRemoveSavedCard}
                    className="flex items-center gap-1 text-[11px] text-content-secondary hover:text-danger transition-colors"
                  >
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>
                <div className="flex rounded-lg border border-border/60 overflow-hidden">
                  <button
                    onClick={() => setUseSaved(true)}
                    className={`flex-1 flex items-center gap-2 px-3 py-2.5 text-sm transition-colors ${
                      useSaved
                        ? "bg-primary/5 border-r border-primary/20 text-content"
                        : "bg-card text-content-secondary hover:bg-muted/30 border-r border-border/40"
                    }`}
                  >
                    <CreditCard className="h-3.5 w-3.5 shrink-0" />
                    <span>●●●● {savedCard.last4}</span>
                    <span className="text-xs text-content-secondary ml-auto">
                      {savedCard.expiry}
                    </span>
                  </button>
                  <button
                    onClick={() => setUseSaved(false)}
                    className={`flex-1 px-3 py-2.5 text-sm transition-colors ${
                      !useSaved
                        ? "bg-primary/5 text-content"
                        : "bg-card text-content-secondary hover:bg-muted/30"
                    }`}
                  >
                    New card
                  </button>
                </div>
              </div>
            )}

            {/* Card fields */}
            {useSaved && savedCard ? (
              /* CVC only for saved card */
              <div>
                <p className="text-xs text-content-secondary mb-2">
                  Charging {savedCard.name} · ●●●● {savedCard.last4}
                </p>
                <div>
                  <Label className="text-xs text-content-secondary mb-1.5 block">
                    CVC
                  </Label>
                  <Input
                    placeholder="123"
                    type="password"
                    className="max-w-[120px]"
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
            ) : (
              /* Full card form for new card */
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
                        setCard({
                          ...card,
                          expiry: formatExpiry(e.target.value),
                        })
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

                {/* Save card checkbox */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none pt-0.5">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-border accent-primary"
                    checked={saveCardChecked}
                    onChange={(e) => setSaveCardChecked(e.target.checked)}
                  />
                  <span className="text-xs text-content-secondary">
                    Save card for future top-ups
                  </span>
                </label>
              </div>
            )}

            {error && <p className="text-xs text-danger">{error}</p>}

            <p className="text-[11px] text-content-tertiary">
              🔒 Mock payment — no real charge will be made
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep("amount")}
                className="gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </Button>
              <Button
                className="flex-1"
                disabled={!isCardValid || isPending}
                onClick={handlePay}
              >
                {isPending ? "Processing…" : `Pay $${amount.toFixed(2)}`}
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Success ──────────────────────────────────────────────── */}
        {step === "success" && result && (
          <div className="space-y-5 text-center">
            <div className="flex justify-center">
              <div className="h-14 w-14 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-success" />
              </div>
            </div>

            <div>
              <p className="font-semibold text-content text-lg">
                +${totalCredits.toFixed(2)} added
              </p>
              {result.bonusAmount > 0 && (
                <p className="text-sm text-success mt-0.5">
                  Includes ${result.bonusAmount.toFixed(2)} bonus (
                  {result.bonusPercent}%)
                </p>
              )}
            </div>

            <div className="rounded-lg border border-border/60 divide-y divide-border/40 overflow-hidden text-sm text-left">
              <div className="flex justify-between px-3 py-2 bg-muted/30">
                <span className="text-content-secondary">Previous balance</span>
                <span className="text-content">
                  ${currentBalance.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between px-3 py-2.5 bg-primary/5">
                <span className="font-semibold text-content">New balance</span>
                <span className="font-bold text-primary">
                  ${result.newBalance.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between px-3 py-2 bg-muted/30">
                <span className="text-content-secondary">Reference</span>
                <span className="font-mono text-xs text-content-secondary">
                  {result.transaction.paymentRef}
                </span>
              </div>
            </div>

            <Button className="w-full" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
