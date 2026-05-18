import { Star } from "lucide-react";
import { motion } from "framer-motion";

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "CTO, Flowbase",
    quote:
      "Notify replaced three separate vendors for us. One integration, way less ops overhead. The template editor alone saved us weeks.",
    rating: 5,
    seed: "Sarah",
  },
  {
    name: "Marcus Webb",
    role: "Founder, Launchpad",
    quote:
      "We were up and running in an afternoon. The API is clean, the docs are solid, and delivery rates are the best we've seen.",
    rating: 5,
    seed: "Marcus",
  },
  {
    name: "Priya Nair",
    role: "Lead Engineer, Stackr",
    quote:
      "SOC 2 certification was a requirement for our enterprise customers. Notify had it ready — procurement was a non-issue.",
    rating: 5,
    seed: "Priya",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 border-t border-border/60">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="heading-section">Loved by developers &amp; teams</h2>
          <p className="text-muted-foreground mt-3">
            See what our customers say about Notify
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.45 }}
              className="bg-card border border-border rounded-xl p-7 flex flex-col gap-5 hover:border-primary/30 transition-colors"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`h-4 w-4 ${j < t.rating ? "text-warning fill-warning" : "text-muted-foreground/40"}`}
                  />
                ))}
              </div>
              <blockquote className="text-sm leading-relaxed text-foreground/80 italic flex-1">
                "{t.quote}"
              </blockquote>
              <div className="flex items-center gap-3">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.seed}`}
                  alt={t.name}
                  className="h-10 w-10 rounded-full bg-muted"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
