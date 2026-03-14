import { useState, useMemo } from "react";
import { Search, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { TemplateCard } from "@/components/TemplateCard";
import { SkeletonGrid } from "@/components/SkeletonCard";
import { useTemplates, useSearchTemplates } from "@/hooks/useTemplates";
import { Template } from "@/types/templates";
import BackgroundDecorator from "@/components/auth/BackgroundDecorator";

type TemplateFilter = "all" | "email" | "sms" | "push" | "in-app";

const filterTabs: { id: TemplateFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "email", label: "Email" },
  { id: "sms", label: "SMS" },
  { id: "push", label: "Push" },
  { id: "in-app", label: "In-App" },
];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function TemplateGallery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<TemplateFilter>("all");

  // Fetch templates using React Query
  const {
    data: templatesData,
    isLoading: isLoadingAll,
    error: errorAll,
  } = useTemplates({
    channel: activeFilter === "all" ? undefined : activeFilter,
    enabled: !searchQuery,
  });

  // Search templates when query exists
  const {
    data: searchData,
    isLoading: isLoadingSearch,
    error: errorSearch,
  } = useSearchTemplates(searchQuery, {
    channel: activeFilter === "all" ? undefined : activeFilter,
    enabled: !!searchQuery,
  });

  // Get current templates and loading state
  const templates = searchQuery ? searchData?.templates : templatesData?.templates;
  const isLoading = searchQuery ? isLoadingSearch : isLoadingAll;
  const error = searchQuery ? errorSearch : errorAll;

  // Group templates by category
  const groupedTemplates = useMemo(() => {
    if (!templates) return {};

    const grouped: Record<string, Template[]> = {};
    templates.forEach((template) => {
      if (!grouped[template.category]) {
        grouped[template.category] = [];
      }
      grouped[template.category].push(template);
    });
    return grouped;
  }, [templates]);

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundDecorator />
      {/* Hero Section */}
      <section className="py-16 border-b border-border/50 relative z-10">
        <div className="container max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="heading-hero mb-4">Explore Notification Templates</h1>
            <p className="text-subtitle text-muted-foreground mb-8">
              Browse ready-to-use templates for Email, SMS, Push, and In-App notifications.
              Start with a template and customize it for your needs.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="sticky top-16 z-40 bg-background/80 backdrop-blur-sm border-b border-border/50 py-4">
        <div className="container px-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveFilter(tab.id);
                  setSearchQuery("");
                }}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
                  activeFilter === tab.id
                    ? "bg-primary-500 text-white"
                    : "bg-card border border-border text-foreground hover:border-primary-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="py-12 relative z-10">
        <div className="container px-4">
          {isLoading ? (
            <SkeletonGrid count={6} />
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-12"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-destructive/10 mb-4">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <p className="text-destructive mb-4 font-medium">Failed to load templates</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
                className="heading-description hover:text-primary"
              >
                Try again
              </button>
            </motion.div>
          ) : !templates || templates.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-12"
            >
              <p className="text-secondary mb-4">No templates found matching your search.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
                className="heading-description hover:text-primary"
              >
                Clear filters
              </button>
            </motion.div>
          ) : (
            Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
              <div key={category} className="mb-12">
                <h2 className="heading-section mb-6 capitalize">
                  {category === "authentication"
                    ? "Authentication"
                    : category === "transactional"
                      ? "Transactional"
                      : category === "marketing"
                        ? "Marketing"
                        : "Alerts"}
                </h2>

                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {categoryTemplates.map((template) => (
                    <motion.div key={template.id} variants={cardVariant}>
                      <TemplateCard template={template} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
