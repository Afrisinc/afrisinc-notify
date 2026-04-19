import { useState } from "react";
import { Mail, MessageSquare, Bell, Smartphone, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OptionButtons } from "@/components/OptionButtons";
import { SearchInput } from "@/components/ui/search-input";
import BackgroundDecorator from "@/components/auth/BackgroundDecorator";

interface TemplateGalleryHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  templatesCount?: number;
  onExplore?: () => void;
}

const categoryTabs = [
  { id: "all", label: "All Templates" },
  { id: "email", label: "Email", icon: <Mail className="w-4 h-4" /> },
  { id: "sms", label: "SMS", icon: <MessageSquare className="w-4 h-4" /> },
  { id: "push", label: "Push", icon: <Bell className="w-4 h-4" /> },
  { id: "in-app", label: "In-App", icon: <Smartphone className="w-4 h-4" /> },
];

export function TemplateGalleryHero({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  templatesCount = 100,
  onExplore,
}: TemplateGalleryHeroProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero pt-20 pb-12">
        <BackgroundDecorator />

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-xs font-semibold">
                ✨ 100+ Ready-to-Use Templates
              </Badge>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="max-w-3xl"
            >
              <h1 className="heading-hero mb-6">
                <span className="text-content block">Perfect notifications</span>
                <span className="text-gradient-primary block">in minutes</span>
              </h1>
              <p className="text-lg text-content-secondary max-w-2xl leading-relaxed">
                Browse 100+ proven templates. Customize in seconds. Every template ships with dark mode, mobile layouts, and full variable support—ready to send today.
              </p>
            </motion.div>

            {/* Search and Browse Section */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 max-w-2xl items-stretch"
            >
              <SearchInput
                value={searchQuery}
                onChange={onSearchChange}
                placeholder="Find by use case (e.g. 'welcome', 'order confirmation')..."
                size="lg"
                className="flex-1"
              />
              <motion.div whileHover={{ scale: 1.02 }}>
                <Button
                  size="lg"
                  onClick={onExplore}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-semibold shadow-primary hover:shadow-primary/50 transition-all rounded-xl"
                >
                  Explore Gallery →
                </Button>
              </motion.div>
            </motion.div>

            {/* Category Stats - Hidden on mobile, shown on desktop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="hidden md:grid grid-cols-3 divide-x divide-border pt-6 border-t border-border/30"
            >
              <div className="text-center px-8">
                <div className="text-2xl font-bold text-content">{templatesCount}+</div>
                <p className="text-xs text-content-secondary mt-1">Templates</p>
              </div>
              <div className="text-center px-8">
                <div className="text-2xl font-bold text-content">2.5M+</div>
                <p className="text-xs text-content-secondary mt-1">Sent Successfully</p>
              </div>
              <div className="text-center px-8">
                <div className="text-2xl font-bold text-content">4.9★</div>
                <p className="text-xs text-content-secondary mt-1">Community Rating</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Category Tabs Section */}
      <section className="sticky top-16 z-40 bg-background/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-border/30 shadow-sm">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 py-4">
            {/* Mobile Filter Toggle */}
            <div className="md:hidden flex items-center justify-between">
              <p className="text-sm font-semibold text-content">Browse by Channel</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                {showMobileFilters ? "Hide" : "Show"}
              </Button>
            </div>

            {/* Category Tabs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={`${showMobileFilters ? "block" : "hidden md:block"}`}
            >
              <OptionButtons
                options={categoryTabs}
                selected={activeFilter}
                onSelect={onFilterChange}
                variant="channel"
                size="md"
                shape="pill"
                responsive="stack"
              />
            </motion.div>

            {/* Filter close button on mobile */}
            {showMobileFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMobileFilters(false)}
                className="w-full md:hidden"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
