import { motion } from "framer-motion";

const STATS = [
  { value: "10K+", label: "Developers" },
  { value: "2B+", label: "Messages delivered" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "<40ms", label: "Median latency" },
];

export function TrustBadges() {
  return (
    <div className="border-y border-border/60">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4"
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className={[
                "py-10 px-6 text-center bg-card",
                i < STATS.length - 1 ? "border-r border-border/60" : "",
              ].join(" ")}
            >
              <p
                className="text-3xl md:text-4xl font-extrabold tracking-tight mb-1"
                style={{
                  background:
                    "linear-gradient(135deg,hsl(210,20%,95%) 0%,hsl(215,15%,60%) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {s.value}
              </p>
              <p className="text-sm text-muted-foreground font-medium">
                {s.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
