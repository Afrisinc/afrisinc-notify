import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  company: string;
  title: string;
  avatar: string;
  rating: 1 | 2 | 3 | 4 | 5;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    quote: "Notify replaced three different services for us. One API for email, SMS, and push — it just works.",
    author: "Amara Osei",
    company: "Paystack",
    title: "Lead Engineer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amara",
    rating: 5,
  },
  {
    id: "2",
    quote: "The template system saved our team hours every week. We went from custom code to drag-and-drop in a day.",
    author: "David Chen",
    company: "Flutterwave",
    title: "Product Manager",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    rating: 5,
  },
  {
    id: "3",
    quote: "Delivery analytics changed how we think about notifications. We can see exactly what's working and what isn't.",
    author: "Sarah Kimani",
    company: "Chipper Cash",
    title: "Growth Lead",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    rating: 4,
  },
  {
    id: "4",
    quote: "Migration was seamless. Their team helped us move over 2M monthly notifications without a single dropped message.",
    author: "Kwame Asante",
    company: "Andela",
    title: "CTO",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kwame",
    rating: 5,
  },
];

export function Testimonials({
  testimonials = DEFAULT_TESTIMONIALS,
  autoRotate = true,
  interval = 5000,
}: {
  testimonials?: Testimonial[];
  autoRotate?: boolean;
  interval?: number;
}) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((p) => (p + 1) % testimonials.length), [testimonials.length]);
  const prev = useCallback(() => setCurrent((p) => (p === 0 ? testimonials.length - 1 : p - 1)), [testimonials.length]);

  useEffect(() => {
    if (!autoRotate || paused) return;
    const t = setInterval(next, interval);
    return () => clearInterval(t);
  }, [autoRotate, paused, interval, next]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next]);

  const t = testimonials[current];

  return (
    <section className="py-20 border-t border-border/50">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="heading-section">Loved by developers & teams</h2>
          <p className="text-foreground/75 dark:text-foreground/80 mt-3">See what our customers say about Notify</p>
        </motion.div>

        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          role="region"
          aria-label="Customer testimonials"
          aria-live="polite"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35 }}
              className="bg-card border border-border rounded-xl p-8 md:p-10 text-center"
            >
              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < t.rating ? "text-warning fill-warning" : "text-muted-foreground/60 dark:text-muted-foreground/50"}`}
                  />
                ))}
              </div>
              <blockquote className="text-lg md:text-xl italic text-foreground dark:text-white leading-relaxed mb-8">
                "{t.quote}"
              </blockquote>
              <div className="flex items-center justify-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.author}
                  className="h-12 w-12 rounded-full bg-muted"
                />
                <div className="text-left">
                  <p className="font-semibold text-foreground dark:text-white">{t.author}</p>
                  <p className="text-sm text-foreground/70 dark:text-foreground/75">{t.title} at {t.company}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-4 mt-6">
            <Button variant="outline" size="icon" onClick={prev} aria-label="Previous testimonial">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-primary" : "w-2 bg-muted-foreground/60 dark:bg-muted-foreground/50"}`}
                />
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={next} aria-label="Next testimonial">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
