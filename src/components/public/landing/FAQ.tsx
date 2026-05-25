import { useState } from "react";
import { motion } from "framer-motion";
import { SearchInput } from "@/components/ui/search-input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const DEFAULT_FAQS: FAQItem[] = [
  {
    id: "1",
    question: "What is Notify?",
    answer:
      "Notify is a multi-channel notification platform that lets you send email, SMS, push, and in-app notifications through a single API. It's designed for developers and teams who need reliable, scalable notification delivery at any volume.",
  },
  {
    id: "2",
    question: "Which channels are supported?",
    answer:
      "We support Email, SMS, Push Notifications, and In-App messaging — all accessible through one unified REST API and dashboard. WhatsApp is coming soon.",
  },
  {
    id: "3",
    question: "How is billing calculated?",
    answer:
      "Subscription plans include a fixed monthly allowance per channel (e.g. Starter includes 50,000 emails and 300 SMS). If you prefer no commitment, our Pay-as-you-go option lets you top up credits and pay per message — credits never expire.",
  },
  {
    id: "4",
    question: "What about security and compliance?",
    answer:
      "We're SOC 2 Type II certified with enterprise-grade encryption at rest and in transit. We support role-based access control, audit logs, and data processing agreements (DPA).",
  },
  {
    id: "5",
    question: "Is there a free plan?",
    answer:
      "Yes! Our free plan includes 500 emails per month, 3 templates, and 1 app — no credit card required. When you're ready to scale, Starter starts at $19/mo and unlocks all channels.",
  },
  {
    id: "6",
    question: "Can I use custom templates?",
    answer:
      "Absolutely. Create templates with our visual drag-and-drop editor or write your own HTML. Templates support dynamic variables like {{name}} and {{code}} and are versioned automatically.",
  },
  {
    id: "7",
    question: "What support options are available?",
    answer:
      "Free and PAYG accounts get community support. Starter includes email support with a 48-hour response time. Scale includes priority support with a 12-hour SLA. Enterprise plans come with a dedicated account manager.",
  },
  {
    id: "8",
    question: "How do I migrate from another service?",
    answer:
      "We provide migration guides and our support team can help you transition. Most teams are fully migrated within a day thanks to our compatible API design and CSV contact import.",
  },
];

export function FAQ({
  items = DEFAULT_FAQS,
  searchable = true,
}: {
  items?: FAQItem[];
  searchable?: boolean;
}) {
  const [query, setQuery] = useState("");

  const filtered = query
    ? items.filter((i) =>
        i.question.toLowerCase().includes(query.toLowerCase()),
      )
    : items;

  return (
    <section className="py-20 border-t border-border/50">
      <div className="container max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="heading-section">Frequently asked questions</h2>
          <p className="text-foreground/75 dark:text-foreground/80 mt-3">
            Everything you need to know about Notify
          </p>
        </motion.div>

        {searchable && (
          <div className="mb-6">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search questions..."
              size="sm"
            />
          </div>
        )}

        <Accordion type="single" collapsible className="space-y-2">
          {filtered.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="bg-card border border-border rounded-lg px-4 data-[state=open]:border-primary/30"
            >
              <AccordionTrigger className="text-left font-semibold text-foreground dark:text-white hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-foreground/80 dark:text-foreground/90 leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {filtered.length === 0 && (
          <p className="text-center text-foreground/70 dark:text-foreground/80 py-8">
            No matching questions found.
          </p>
        )}
      </div>
    </section>
  );
}
