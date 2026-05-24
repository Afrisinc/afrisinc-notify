import { Link } from "react-router-dom";
import {
  ArrowRight,
  Zap,
  Check,
  Code2,
  BarChart3,
  Shield,
  Users,
  Key,
  Cpu,
  Globe,
  Layers,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import BackgroundDecorator from "@/components/auth/BackgroundDecorator";
import { Testimonials } from "@/components/public/landing/Testimonials";
import { TrustBadges } from "@/components/public/landing/TrustBadges";
import { HowItWorks } from "@/components/public/landing/HowItWorks";
import { FAQ } from "@/components/public/landing/FAQ";
import { CodeSnippet } from "@/components/public/landing/CodeSnippet";
import { ChannelStrip } from "@/components/public/landing/ChannelStrip";
import { usePublicPlans } from "@/hooks/useSubscription";

// ── Feature cards ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Code2,
    title: "Simple unified API",
    desc: "One integration, every channel. Switch providers without changing a single line of code.",
  },
  {
    icon: Layers,
    title: "Template engine",
    desc: "Rich drag-and-drop email editor with dynamic variables, layouts, and version history.",
  },
  {
    icon: BarChart3,
    title: "Delivery analytics",
    desc: "Track opens, clicks, bounces, and conversions in real time across all channels.",
  },
  {
    icon: Globe,
    title: "Custom domains",
    desc: "Full DKIM/SPF setup from your dashboard. Send from your own domain in minutes.",
  },
  {
    icon: Shield,
    title: "SOC 2 certified",
    desc: "Enterprise-grade security with end-to-end encryption and GDPR compliance built in.",
  },
  {
    icon: Users,
    title: "Team management",
    desc: "Invite members with granular RBAC. Manage multiple orgs from a single account.",
  },
  {
    icon: Key,
    title: "OAuth integrations",
    desc: "Connect your existing stack — Slack, HubSpot, Segment, and more in one click.",
  },
  {
    icon: Cpu,
    title: "Webhooks & events",
    desc: "Subscribe to any delivery event and build automations on top of notification data.",
  },
];

// CTA mapping based on plan name
const planCtas: Record<string, string> = {
  FREE: "Start for free",
  STARTER: "Start 14-day free trial",
  SCALE: "Get Scale",
  ENTERPRISE: "Talk to sales",
};

function PricingSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-6">
          <Skeleton className="h-6 w-20 mb-3" />
          <Skeleton className="h-12 w-28 mb-2" />
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-12 w-full rounded-xl mb-4" />
          <div className="space-y-3">
            {[0, 1, 2, 3].map((j) => (
              <Skeleton key={j} className="h-4 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
      <span className="text-xs font-semibold text-primary uppercase tracking-wider">
        {children}
      </span>
    </div>
  );
}

// Plan descriptions for landing page
const planDescriptions: Record<string, string> = {
  FREE: "Email only — test before you commit.",
  STARTER: "All channels unlocked — best entry point.",
  SCALE: "For fast-growing businesses.",
  ENTERPRISE: "Large operations — negotiated volume.",
};

// Generate features from plan limits for landing page
const generateLandingFeatures = (
  limits: Array<{ metric: string; limit: number | string; period: string }>,
  planName: string,
): string[] => {
  const features: string[] = [];
  const formatVal = (v: number | string) =>
    v === "Unlimited"
      ? "Unlimited"
      : typeof v === "number"
        ? v.toLocaleString()
        : v;

  const metricMap: Record<string, string> = {
    emails_per_month: "emails / mo",
    sms_per_month: "SMS / mo",
    push_subscribers: "push subscribers",
    in_app_per_month: "in-app / mo",
    apps: "apps",
    contacts: "contacts",
    custom_domain: "custom domain (DKIM/SPF)",
    webhooks: "webhooks",
  };

  for (const [metric, label] of Object.entries(metricMap)) {
    const l = limits.find((x) => x.metric === metric);
    if (
      l &&
      (l.limit === "Unlimited" || (typeof l.limit === "number" && l.limit > 0))
    ) {
      features.push(`${formatVal(l.limit)} ${label}`);
    }
  }

  // Plan-specific extras
  if (planName === "STARTER") features.push("API access + 3 webhooks");
  if (planName === "SCALE") {
    features.push(
      "A/B testing + advanced analytics",
      "Priority support (12h SLA)",
      "Dedicated email IP",
    );
  }
  if (planName === "ENTERPRISE") {
    features.push(
      "Dedicated IP + account manager",
      "99.9% uptime SLA",
      "SSO / SAML / LDAP",
      "Africa-region data residency",
    );
  }
  if (planName === "FREE") features.push("Community support");

  return features.slice(0, 8);
};

const Landing = () => {
  const { data: plansData, isLoading: plansLoading } = usePublicPlans();

  // Transform plans data for display (filter out PAYG and PRO plans)
  const tiers = (plansData ?? [])
    .filter((p) => p.name !== "PAYG" && p.name !== "PRO")
    .map((plan) => {
      const displayName =
        plan.name.charAt(0) + plan.name.slice(1).toLowerCase();
      return {
        name: displayName,
        price: plan.priceMonthly === 0 ? "$0" : `$${plan.priceMonthly}`,
        priceNote: plan.priceMonthly > 0 ? "/ month" : undefined,
        desc: planDescriptions[plan.name] || "",
        cta: planCtas[plan.name] ?? `Get ${displayName}`,
        highlighted: plan.name === "STARTER",
        badge: plan.name === "STARTER" ? "Best Value" : undefined,
        features: generateLandingFeatures(plan.limits, plan.name),
      };
    });

  return (
    <div className="overflow-hidden">
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 bg-gradient-hero overflow-hidden">
        <BackgroundDecorator />
        {/* Extra glow orbs */}
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-primary/[0.06] blur-3xl" />
        <div className="pointer-events-none absolute top-40 -right-48 w-[400px] h-[400px] rounded-full bg-primary/[0.04] blur-3xl" />

        <div className="container relative z-10">
          <div className="grid lg:grid-cols-[55fr_45fr] gap-12 items-center">
            {/* Left: copy */}
            <div className="flex flex-col gap-5 items-start">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45 }}
                className="inline-flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1"
              >
                <Zap className="h-3 w-3" /> SOC 2 Type II certified
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-heading text-[clamp(2.2rem,4vw,3rem)] font-bold leading-[1.1] tracking-tight text-foreground"
              >
                Send notifications,{" "}
                <span className="text-gradient-primary">not headaches</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="text-lg leading-relaxed text-muted-foreground max-w-md"
              >
                One API to send Email, SMS, Push, and in-app notifications at
                scale. Built for developers, loved by teams.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex items-center gap-3 flex-wrap"
              >
                <Button asChild variant="default" size="md">
                  <Link
                    to="/signup?plan=FREE"
                    className="flex items-center gap-2"
                  >
                    Create free account <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary-outline" size="md">
                  <Link to="/docs">View docs</Link>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.55 }}
                className="flex items-center gap-6 flex-wrap"
              >
                {[
                  "10,000+ developers",
                  "99.9% uptime SLA",
                  "Free up to 500 emails/mo",
                ].map((t) => (
                  <div key={t} className="flex items-center gap-1.5">
                    <Check
                      className="h-3.5 w-3.5 text-success shrink-0"
                      strokeWidth={2.5}
                    />
                    <span className="text-sm text-muted-foreground">{t}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: code snippet */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <CodeSnippet />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Channel strip ──────────────────────────────────────────────────── */}
      <ChannelStrip />

      {/* ── Trust stats ────────────────────────────────────────────────────── */}
      <TrustBadges />

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" className="py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <SectionBadge>Features</SectionBadge>
            <h2 className="heading-section mb-4">
              Everything you need to ship faster
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              From first API call to millions of messages — Notify handles the
              infrastructure so you can focus on your product.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="group bg-card border border-border rounded-xl p-6 hover:border-primary/30 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200"
              >
                <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 leading-snug">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <HowItWorks />

      {/* ── Pricing ────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 border-t border-border/60">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <SectionBadge>Pricing</SectionBadge>
            <h2 className="heading-section mb-4">
              Built for Africa. Priced for Africa.
            </h2>
            <p className="text-lg text-muted-foreground">
              Start for free. Scale as you grow. No surprise fees. All prices in
              USD.
            </p>
          </motion.div>

          {plansLoading && <PricingSkeleton />}
          {!plansLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {tiers.map((tier, i) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.45 }}
                  className={[
                    "relative rounded-2xl p-6 flex flex-col gap-4 border transition-all",
                    tier.highlighted
                      ? "bg-card border-primary/40 shadow-[0_0_40px_rgba(2,147,228,0.1)]"
                      : "bg-card border-border hover:border-primary/20",
                  ].join(" ")}
                >
                  {tier.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                      Best Value
                    </div>
                  )}

                  <div>
                    <p className="font-bold text-lg text-foreground mb-1">
                      {tier.name}
                    </p>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-4xl font-extrabold tracking-tight text-foreground">
                        {tier.price}
                      </span>
                      {"priceNote" in tier && tier.priceNote && (
                        <span className="text-sm text-muted-foreground">
                          {tier.priceNote}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tier.desc}
                    </p>
                  </div>

                  <a
                    href={
                      tier.name === "Enterprise"
                        ? "/contact"
                        : `/signup?plan=${tier.name.toUpperCase()}`
                    }
                    className={[
                      "w-full py-3 rounded-xl font-semibold text-sm text-center transition-all border",
                      tier.highlighted
                        ? "bg-primary text-primary-foreground border-primary shadow-[0_4px_14px_rgba(2,147,228,0.3)] hover:bg-primary/90"
                        : "bg-transparent text-foreground border-border hover:border-primary/40 hover:text-primary",
                    ].join(" ")}
                  >
                    {tier.cta}
                  </a>

                  <ul className="space-y-3">
                    {tier.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2.5 text-sm text-muted-foreground"
                      >
                        <Check
                          className="h-4 w-4 text-success shrink-0 mt-0.5"
                          strokeWidth={2.5}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-center mt-8"
          >
            <Link
              to="/pricing"
              className="text-sm font-medium text-primary hover:underline"
            >
              View full pricing details →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────────── */}
      <Testimonials />

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <FAQ />

      {/* ── CTA Band ───────────────────────────────────────────────────────── */}
      <section className="py-24 border-t border-border/60">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-card border border-primary/20 rounded-3xl px-8 py-20 text-center overflow-hidden"
          >
            {/* Radial glow */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="w-[500px] h-[300px] rounded-full bg-primary/[0.07] blur-3xl" />
            </div>

            <div className="relative z-10 max-w-lg mx-auto">
              <h2 className="font-heading text-[clamp(2rem,3.5vw,2.8rem)] font-bold leading-tight tracking-tight text-foreground mb-4">
                Start building today
              </h2>
              <p className="text-lg text-muted-foreground mb-9 leading-relaxed">
                Free forever for small projects. No credit card. No lock-in.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Button asChild variant="default" size="md">
                  <Link
                    to="/signup?plan=FREE"
                    className="flex items-center gap-2"
                  >
                    Create free account <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary-outline" size="md">
                  <Link to="/pricing">View pricing</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
