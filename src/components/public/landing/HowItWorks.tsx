import { FileText, Variable, Send, BarChart3, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface Step {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const DEFAULT_STEPS: Step[] = [
  {
    number: 1,
    icon: <FileText className="h-5 w-5" />,
    title: "Create a template",
    description: "Design email, SMS, or push templates with our visual editor.",
  },
  {
    number: 2,
    icon: <Variable className="h-5 w-5" />,
    title: "Add variables",
    description: "Insert dynamic placeholders like {{name}} and {{code}}.",
  },
  {
    number: 3,
    icon: <Send className="h-5 w-5" />,
    title: "Send notification",
    description: "Trigger via API or dashboard with recipient data.",
  },
  {
    number: 4,
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Track delivery",
    description: "Monitor opens, clicks, and delivery in real-time.",
  },
];

export function HowItWorks({ steps = DEFAULT_STEPS }: { steps?: Step[] }) {
  return (
    <section className="py-20 border-t border-border/50">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="heading-section">How it works</h2>
          <p className="text-foreground/75 dark:text-foreground/80 mt-3">
            Get started in minutes with four simple steps
          </p>
        </motion.div>

        {/* Desktop: horizontal */}
        <div className="hidden md:flex items-start justify-between gap-4">
          {steps.map((s, i) => (
            <div key={s.number} className="flex items-start gap-4 flex-1">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="flex flex-col items-center text-center flex-1"
              >
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mb-4">
                  {s.number}
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
                  {s.icon}
                </div>
                <h3 className="font-semibold text-foreground dark:text-white mb-1">
                  {s.title}
                </h3>
                <p className="text-sm text-foreground/70 dark:text-foreground/75">
                  {s.description}
                </p>
              </motion.div>
              {i < steps.length - 1 && (
                <ArrowRight className="h-5 w-5 text-muted-foreground/70 dark:text-muted-foreground/60 mt-5 shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Mobile: vertical timeline */}
        <div className="md:hidden space-y-0">
          {steps.map((s, i) => (
            <motion.div
              key={s.number}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="flex gap-4"
            >
              <div className="flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                  {s.number}
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px flex-1 bg-border my-2" />
                )}
              </div>
              <div className="pb-8">
                <h3 className="font-semibold text-foreground dark:text-white">
                  {s.title}
                </h3>
                <p className="text-sm text-foreground/70 dark:text-foreground/75 mt-1">
                  {s.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
