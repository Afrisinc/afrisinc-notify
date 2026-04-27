import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PRICING_FAQS = [
  {
    id: "1",
    q: "Can I change plans anytime?",
    a: "Yes. Upgrade or downgrade at any time. Changes take effect on your next billing cycle.",
  },
  {
    id: "2",
    q: "How is usage calculated?",
    a: "Each notification sent counts as one unit, regardless of channel. Bulk sends count individually per recipient.",
  },
  {
    id: "3",
    q: "What happens if I exceed limits?",
    a: "We'll notify you at 80% and 100% usage. Overages are billed at the per-notification rate for your plan.",
  },
  {
    id: "4",
    q: "Are there setup fees?",
    a: "No setup fees on any plan. Enterprise contracts may include onboarding services.",
  },
  {
    id: "5",
    q: "Is there a free trial?",
    a: "Pro plans come with a 14-day free trial. No credit card required to start.",
  },
  {
    id: "6",
    q: "Do you offer discounts for annual plans?",
    a: "Yes! Annual billing saves you 20% compared to monthly pricing.",
  },
  {
    id: "7",
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards, bank transfers for Enterprise, and M-Pesa for African businesses.",
  },
  {
    id: "8",
    q: "What's your refund policy?",
    a: "We offer a 30-day money-back guarantee on all paid plans. No questions asked.",
  },
];

export function PricingFAQ() {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="heading-section text-center mb-10">Pricing FAQ</h2>
      <Accordion type="single" collapsible className="space-y-2">
        {PRICING_FAQS.map((item) => (
          <AccordionItem
            key={item.id}
            value={item.id}
            className="bg-card border border-border rounded-lg px-4 data-[state=open]:border-primary/30"
          >
            <AccordionTrigger className="text-left font-semibold text-foreground dark:text-white hover:no-underline">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-foreground/80 dark:text-foreground/90 leading-relaxed">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
