import { TrendingUp, Users, Shield, Award } from "lucide-react";
import { motion } from "framer-motion";

interface TrustBadge {
  icon: React.ReactNode;
  number: string;
  label: string;
}

const DEFAULT_BADGES: TrustBadge[] = [
  {
    icon: <TrendingUp className="h-8 w-8" />,
    number: "99.9%",
    label: "API Uptime",
  },
  {
    icon: <Users className="h-8 w-8" />,
    number: "10K+",
    label: "Active Users",
  },
  { icon: <Shield className="h-8 w-8" />, number: "SOC 2", label: "Certified" },
  {
    icon: <Award className="h-8 w-8" />,
    number: "4.8/5",
    label: "Average Rating",
  },
];

export function TrustBadges({
  badges = DEFAULT_BADGES,
}: {
  badges?: TrustBadge[];
}) {
  return (
    <section className="py-16 border-t border-border/50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {badges.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="flex flex-col items-center text-center gap-2 p-4"
            >
              <div className="text-primary">{b.icon}</div>
              <span className="text-2xl font-bold text-foreground dark:text-white">
                {b.number}
              </span>
              <span className="text-sm text-foreground/70 dark:text-foreground/75">
                {b.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
