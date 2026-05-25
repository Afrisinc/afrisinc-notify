import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PRICING_FAQS = [
  {
    id: "1",
    q: "How does the per-1,000 email rate work technically?",
    a: 'Your credit balance is stored in dollars. Every single email sent deducts $0.0008 (which is $0.80 ÷ 1,000). So sending 1 email costs $0.0008. Sending 5,000 emails costs $4.00. The "per 1,000" framing is just easier to read on the pricing page — internally everything is per single message deducted in real time from your balance.',
  },
  {
    id: "2",
    q: "What is the difference between PAYG and plan overages?",
    a: "PAYG is for customers with no subscription — you top up credits and spend freely at the higher PAYG rates. Plan overage is for subscribers who exceed their monthly allowance — it bills automatically at month end at the lower overage rates. A Starter customer pays $0.025/SMS overage. A PAYG customer pays $0.035/SMS. The subscription always gives a better per-unit rate.",
  },
  {
    id: "3",
    q: "Do PAYG credits expire?",
    a: "Never. Credits you top up stay in your account indefinitely. No monthly reset, no expiry date, no pressure to spend them. This makes PAYG genuinely useful for seasonal businesses or projects with irregular sending patterns.",
  },
  {
    id: "4",
    q: "When should I switch from PAYG to a plan?",
    a: "The moment your monthly PAYG spend approaches $19, switching to Starter is better value. On Starter you pay $19 flat and get 50,000 emails, 300 SMS, push, in-app, API, and custom domain all included. On PAYG that same usage would cost significantly more at the higher per-unit rate.",
  },
  {
    id: "5",
    q: "Will WhatsApp pricing change when it launches?",
    a: "WhatsApp rates are ultimately set by Meta and vary by country and conversation type. We maintain a margin buffer specifically to absorb Meta price changes without immediately passing them to customers. When WhatsApp launches we will publish the rates at that time and give existing customers 30 days notice of any future changes.",
  },
  {
    id: "6",
    q: "Can I cancel anytime?",
    a: "Yes. Monthly plans cancel at any time effective at the end of the current billing period — no penalty, no questions. Annual plans can be cancelled with unused months refunded pro-rata as platform credits. PAYG has no subscription to cancel — your credits simply stay on your account.",
  },
  {
    id: "7",
    q: "Can I pay in local African currency?",
    a: "We are actively working on NGN, KES, GHS and ZAR payment options. Currently payments process in USD via card or mobile money. If local currency is critical for your business contact us directly and we will work something out.",
  },
  {
    id: "8",
    q: "Do you offer discounts for annual plans?",
    a: "Yes! Annual billing saves you 20% compared to monthly pricing. Starter drops from $19 to $15/month and Scale drops from $69 to $55/month when billed annually.",
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
