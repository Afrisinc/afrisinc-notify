import { useState, useMemo } from "react";
import {
  Search,
  AlertCircle,
  Sparkles,
  Filter,
  X,
  TrendingUp,
  Star,
  Download,
  ArrowRight,
  Flame,
  Award,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTemplates, useSearchTemplates } from "@/hooks/useTemplates";
import { Template } from "@/types/templates";
import { useNavigate } from "react-router-dom";
import BackgroundDecorator from "@/components/auth/BackgroundDecorator";
import { MarketplaceTemplateCard } from "@/components/MarketplaceTemplateCard";
import { MarketplaceTemplatePreviewDialog } from "@/components/MarketplaceTemplatePreviewDialog";
import { TemplateGalleryHero } from "@/components/TemplateGalleryHero";
import { TemplateCategorySection } from "@/components/TemplateCategorySection";
import { MarketplaceTemplate } from "@/data/marketplaceTemplates";
import { Skeleton } from "@/components/ui/skeleton";

type TemplateFilter = "all" | "email" | "sms" | "push" | "in-app";
type SortOption = "trending" | "rating" | "newest" | "popular";

const filterTabs: { id: TemplateFilter; label: string }[] = [
  { id: "all", label: "All Channels" },
  { id: "email", label: "Email" },
  { id: "sms", label: "SMS" },
  { id: "push", label: "Push" },
  { id: "in-app", label: "In-App" },
];

const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: "trending", label: "Trending Now", icon: <Flame className="h-4 w-4 text-orange-500" /> },
  { value: "rating", label: "Highest Rated", icon: <Award className="h-4 w-4 text-primary" /> },
  { value: "popular", label: "Most Popular", icon: <TrendingUp className="h-4 w-4 text-green-500" /> },
  { value: "newest", label: "Just Added", icon: <Clock className="h-4 w-4 text-blue-500" /> },
];

export default function TemplateGallery() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<TemplateFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("trending");
  const [previewTemplate, setPreviewTemplate] = useState<MarketplaceTemplate | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleExplore = () => {
    document.getElementById('templates-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

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
  const apiTemplates = searchQuery ? searchData?.templates : templatesData?.templates;
  const isLoading = searchQuery ? isLoadingSearch : isLoadingAll;
  const error = searchQuery ? errorSearch : errorAll;

  const templates = apiTemplates || [];

  // Filter and sort templates
  const filteredAndSortedTemplates = useMemo(() => {
    let filtered = templates.filter((tpl: any) => {
      const matchesSearch =
        !searchQuery ||
        tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tpl.tags && tpl.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesChannel = activeFilter === "all" || tpl.channel === activeFilter;

      return matchesSearch && matchesChannel;
    });

    // Sort
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "popular":
          return (b.downloads || 0) - (a.downloads || 0);
        case "newest":
          return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
        case "trending":
        default:
          return (b.installs || 0) - (a.installs || 0);
      }
    });

    return filtered;
  }, [templates, searchQuery, activeFilter, sortBy]);

  const handleUseTemplate = (template: any) => {
    // Redirect to signup with template info
    window.location.href = `/signup?template=${template.slug || template.id}`;
  };

  const handlePreview = (template: MarketplaceTemplate) => {
    setPreviewTemplate(template);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundDecorator />

      {/* Hero Section */}
      <TemplateGalleryHero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={(filter) => {
          setActiveFilter(filter as TemplateFilter);
          setSearchQuery("");
        }}
        templatesCount={100}
        onExplore={handleExplore}
      />

      {/* Templates Grid */}
      <section id="templates-grid" className="py-12 relative z-10">
        <div className="container max-w-6xl mx-auto px-4">
          {/* Loading State - Template skeleton */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <Card key={i} className="border-border/40 rounded-2xl overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-muted to-muted/50 animate-pulse" />
                  <CardContent className="pt-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-8 flex-1" />
                      <Skeleton className="h-8 flex-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredAndSortedTemplates.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center py-20"
            >
              {/* Animated empty state icon */}
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6"
              >
                <AlertCircle className="h-10 w-10 text-primary/50" />
              </motion.div>
              <h3 className="text-lg font-bold text-content mb-2">No templates match</h3>
              <p className="text-content-secondary mb-6 max-w-sm mx-auto">Try different keywords or explore templates from other categories.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                  setSortBy("trending");
                }}
              >
                View All Templates
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-16">
              {/* Group templates by category */}
              {(() => {
                const groupedByCategory: Record<string, any[]> = {};
                filteredAndSortedTemplates.forEach((template: any) => {
                  const cat = template.category || "other";
                  if (!groupedByCategory[cat]) {
                    groupedByCategory[cat] = [];
                  }
                  groupedByCategory[cat].push(template);
                });

                const categoryOrder = ["transactional", "marketing", "authentication", "alerts", "ecommerce"];
                const sortedCategories = categoryOrder.filter((cat) => groupedByCategory[cat]);

                if (sortedCategories.length === 0) {
                  sortedCategories.push(...Object.keys(groupedByCategory));
                }

                return sortedCategories.map((category) => {
                  const categoryTemplates = groupedByCategory[category];
                  const categoryTitles: Record<string, string> = {
                    transactional: "Transactional Essentials",
                    marketing: "Marketing That Converts",
                    authentication: "Secure & Seamless Auth",
                    alerts: "Keep Users Informed",
                    ecommerce: "E-Commerce Ready",
                    other: "More Templates",
                  };

                  return (
                    <div key={category} className="space-y-8">
                      <TemplateCategorySection
                        category={category}
                        title={categoryTitles[category] || category}
                        description=""
                        count={categoryTemplates.length}
                        onViewCategory={() => {
                          setActiveFilter(category as TemplateFilter);
                        }}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {categoryTemplates.map((template: any, idx: number) => (
                          <motion.div
                            key={template.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                          >
                            <MarketplaceTemplateCard
                              template={template}
                              onInstall={() => handleUseTemplate(template)}
                              onPreview={() => handlePreview(template)}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 border-t border-border/50 relative z-10">
        <div className="container max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center space-y-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 border border-primary/20"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-content">
              Pick a template. Send today.
            </h2>
            <p className="text-content-secondary text-lg">
              All templates include mobile layouts, dark mode, and full variable support. Customize once, use everywhere.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button
                size="lg"
                onClick={() => (window.location.href = "/signup")}
                className="gap-2"
              >
                Start for Free <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => (window.location.href = "/login")}
              >
                Sign In
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Preview Dialog */}
      <MarketplaceTemplatePreviewDialog
        open={!!previewTemplate}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
        template={previewTemplate}
        onAction={(template) => handleUseTemplate(template)}
        actionLabel="Use This Template"
        variant="public"
      />
    </div>
  );
}
