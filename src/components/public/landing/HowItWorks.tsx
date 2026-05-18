import { motion } from "framer-motion";

const STEPS = [
  {
    n: "01",
    title: "Create your app",
    desc: "Sign up and create an app in the dashboard. Get your API key instantly — no credit card required.",
  },
  {
    n: "02",
    title: "Build your template",
    desc: "Design email, SMS or push templates using our visual editor, or bring your own HTML.",
  },
  {
    n: "03",
    title: "Send at scale",
    desc: "Call our API, set up automations, or trigger from webhooks. We handle delivery, retries and reporting.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 border-t border-border/60 bg-card/40">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              How it works
            </span>
          </div>
          <h2 className="heading-section">Up and running in minutes</h2>
        </motion.div>

        {/* Steps */}
        <div className="relative grid md:grid-cols-3 gap-0">
          {/* Connector line */}
          <div className="hidden md:block absolute top-7 left-[calc(16.5%)] right-[calc(16.5%)] h-px bg-gradient-to-r from-border via-primary/30 to-border" />

          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="flex flex-col items-center text-center px-8"
            >
              <div
                className={[
                  "w-14 h-14 rounded-full flex items-center justify-center relative z-10 mb-6 border-2 transition-all",
                  i === 1
                    ? "bg-primary border-primary shadow-[0_0_24px_rgba(2,147,228,0.35)]"
                    : "bg-card border-border",
                ].join(" ")}
              >
                <span
                  className={[
                    "font-mono text-sm font-semibold",
                    i === 1
                      ? "text-primary-foreground"
                      : "text-muted-foreground",
                  ].join(" ")}
                >
                  {s.n}
                </span>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">
                {s.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
