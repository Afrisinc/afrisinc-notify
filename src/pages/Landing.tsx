import { Link } from "react-router-dom";
import { Zap, Mail, MessageSquare, Bell, ArrowRight, Shield, BarChart3, Code2 } from "lucide-react";
import { motion } from "framer-motion";
import { getAuthUrls } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  { icon: Mail, title: "Email", description: "Transactional and marketing emails with rich templates." },
  { icon: MessageSquare, title: "SMS", description: "Deliver time-sensitive messages directly to phones." },
  { icon: Bell, title: "Push Notifications", description: "Engage users with real-time browser and mobile push." },
  { icon: Code2, title: "Simple API", description: "One unified API for all notification channels." },
  { icon: BarChart3, title: "Delivery Analytics", description: "Track delivery, opens, and engagement in real-time." },
  { icon: Shield, title: "Enterprise Ready", description: "Multi-tenant, role-based access, and audit logs." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const Landing = () => {
  const { user } = useAuth();
  const { signupUrl } = getAuthUrls();

  return (
    <div>
      {/* Hero */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="container text-center max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-6"
          >
            <Zap className="h-3 w-3" /> Notification infrastructure for developers
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="heading-hero mb-6 animate-fade-up"
          >
            Send notifications,{" "}
            <span className="text-primary">not headaches</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-subtitle mb-10 max-w-xl mx-auto"
          >
            One API for Email, SMS, and Push. Create templates, manage delivery, and
            track everything from a single dashboard.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex items-center justify-center gap-4"
          >
            <Button asChild variant="default" size="md">
              {user ? (
                <Link to="/dashboard">
                  Go to App <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <a href={signupUrl}>
                  Start for free <ArrowRight className="h-4 w-4" />
                </a>
              )}
            </Button>
            <Button asChild variant="secondary-outline" size="md">
              <Link to="/pricing">
                View pricing
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border/50">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="heading-section text-center mb-12"
          >
            Everything you need to deliver notifications
          </motion.h2>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                custom={i}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="heading-subsection">{f.title}</h3>
                <p className="text-secondary text-sm">{f.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t border-border/50">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="container text-center max-w-xl"
        >
          <h2 className="heading-section mb-6">
            Ready to get started?
          </h2>
          <p className="text-secondary mb-8">
            Create your account and start sending notifications in under 5 minutes.
          </p>
          <Button asChild variant="primary-solid" size="md">
            {user ? (
              <Link to="/dashboard">
                Go to App <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <a href={signupUrl}>
                Create free account <ArrowRight className="h-4 w-4" />
              </a>
            )}
          </Button>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;
