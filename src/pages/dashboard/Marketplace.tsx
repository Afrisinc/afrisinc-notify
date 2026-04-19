import { useState, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
  Download,
  Star,
  Store,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Filter,
  X,
  Flame,
  Clock,
  Award,
  ChevronDown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMarketplaceTemplates } from "@/hooks/useMarketplace";
import { useInstallMarketplaceTemplate } from "@/hooks/useMarketplace";
import { useApps } from "@/hooks/useApps";
import { useOrg } from "@/contexts/OrgContext";
import { useCurrentAccountId } from "@/hooks/useAuth";
import { MarketplaceTemplateCard } from "@/components/MarketplaceTemplateCard";
import { MarketplaceTemplatePreviewDialog } from "@/components/MarketplaceTemplatePreviewDialog";
import { TemplateSkeletonGrid } from "@/components/TemplateCardSkeleton";
import { MarketplaceTemplate } from "@/data/marketplaceTemplates";
import { motion } from "framer-motion";
import { OptionButtons } from "@/components/OptionButtons";
import { SearchInput } from "@/components/ui/search-input";

type ChannelFilter = "all" | "email" | "sms" | "push" | "in-app";
type PriceFilter = "all" | "free" | "paid";
type SortOption = "trending" | "rating" | "newest" | "popular";

const channelOptions = [
  { id: "all", label: "All Channels" },
  { id: "email", label: "Email" },
  { id: "sms", label: "SMS" },
  { id: "push", label: "Push" },
  { id: "in-app", label: "In-App" },
];

const priceOptions = [
  { id: "all", label: "All" },
  { id: "free", label: "Free" },
  { id: "paid", label: "Paid" },
];

const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: "trending", label: "Trending Now", icon: <Flame className="h-4 w-4 text-orange-500" /> },
  { value: "rating", label: "Highest Rated", icon: <Award className="h-4 w-4 text-primary" /> },
  { value: "popular", label: "Most Popular", icon: <TrendingUp className="h-4 w-4 text-green-500" /> },
  { value: "newest", label: "Just Added", icon: <Clock className="h-4 w-4 text-blue-500" /> },
];

const ITEMS_PER_PAGE = 12;

export default function Marketplace() {
  const { currentOrg } = useOrg();
  const accountId = useCurrentAccountId();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("trending");
  const [installTemplate, setInstallTemplate] = useState<MarketplaceTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<MarketplaceTemplate | null>(null);
  const [selectedAppId, setSelectedAppId] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allLoadedTemplates, setAllLoadedTemplates] = useState<MarketplaceTemplate[]>([]);

  // Use real API if available, fallback to mock data
  let templates: MarketplaceTemplate[] = [];
  let isLoading = false;
  let error: Error | null = null;
  let totalCount = 0;

  const { data: templatesResponse, isLoading: apiLoading, error: apiError } = useMarketplaceTemplates({
    search: search || undefined,
    channel: channelFilter !== "all" ? channelFilter : undefined,
    price: priceFilter !== "all" ? priceFilter : undefined,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });

  templates = templatesResponse?.templates || [];
  totalCount = templatesResponse?.total || 0;
  isLoading = apiLoading;
  error = apiError;

  // Update all loaded templates when page changes
  const displayTemplates = currentPage === 1 ? templates : allLoadedTemplates;

  // Fetch user's apps
  const { data: appsResponse } = useApps({ enabled: !!accountId });
  const userApps = appsResponse?.apps || [];

  // Install mutation
  const installMutation = useInstallMarketplaceTemplate();

  // Filter and sort templates
  const filteredAndSortedTemplates = useMemo(() => {
    let filtered = displayTemplates.filter((tpl) => {
      const matchesSearch =
        !search ||
        tpl.name.toLowerCase().includes(search.toLowerCase()) ||
        tpl.description.toLowerCase().includes(search.toLowerCase()) ||
        tpl.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

      const matchesChannel = channelFilter === "all" || tpl.channel === channelFilter;
      const matchesPrice =
        priceFilter === "all" ||
        (priceFilter === "free" && tpl.price === 0) ||
        (priceFilter === "paid" && tpl.price > 0);

      return matchesSearch && matchesChannel && matchesPrice;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "popular":
          return b.downloads - a.downloads;
        case "newest":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "trending":
        default:
          return b.installs - a.installs;
      }
    });

    return filtered;
  }, [displayTemplates, search, channelFilter, priceFilter, sortBy]);

  // Handle Load More
  const handleLoadMore = useCallback(async () => {
    setIsLoadingMore(true);
    try {
      // Simulate delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 300));

      const newPage = currentPage + 1;
      setAllLoadedTemplates((prev) => [...prev, ...templates]);
      setCurrentPage(newPage);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load more templates",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, templates, toast]);

  // Reset pagination when filters change
  const handleFilterChange = useCallback(
    (setter: (value: any) => void, value: any) => {
      setter(value);
      setCurrentPage(1);
      setAllLoadedTemplates([]);
    },
    []
  );

  const hasMoreTemplates = currentPage * ITEMS_PER_PAGE < totalCount;

  const handleInstall = async () => {
    if (!selectedAppId || !installTemplate) return;
    try {
      await installMutation.mutateAsync({
        templateId: installTemplate.id,
        payload: {
          appId: selectedAppId,
          templateName: installTemplate.name,
        },
      });
      toast({
        title: "Success",
        description: `"${installTemplate.subject}" has been installed to your app.`,
      });
      setInstallTemplate(null);
      setSelectedAppId("");
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to install template",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section - Dark Mode Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-4 pb-6 border-b border-border/30 bg-gradient-to-b from-background to-background/50 dark:from-background dark:to-background/70 rounded-xl p-6 -mx-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-primary via-primary to-primary/50 rounded-full" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-primary" />
              <h1 className="text-3xl font-bold text-content dark:text-white">Marketplace</h1>
            </div>
          </div>
        </div>
        <p className="text-base text-content-secondary dark:text-foreground/70 leading-relaxed max-w-2xl font-medium">
          Pick templates built for real-world use. Every one includes dark mode, mobile layouts, and full variable support. Install to any app in seconds.
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Find a template (e.g. welcome, order confirmation, password reset)..."
          size="lg"
          inputClassName="h-11 text-base"
        />
      </motion.div>

      {/* Filter Bar - Redesigned for Better Alignment */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="flex flex-col gap-6"
      >
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex gap-2">
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Desktop Filters / Mobile Expanded */}
        <div
          className={`space-y-5 ${
            showFilters ? "block" : "hidden lg:block"
          }`}
        >
          {/* Row 1: Channel Filter */}
          <div className="space-y-3">
            <Label className="text-xs font-bold text-content-secondary uppercase tracking-wider">
              Channel
            </Label>
            <OptionButtons
              options={channelOptions}
              selected={channelFilter}
              onSelect={(id) => handleFilterChange(setChannelFilter, id as ChannelFilter)}
              variant="channel"
              size="md"
              shape="pill"
            />
          </div>

          {/* Row 2: Price & Sort */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price Filter */}
            <div className="space-y-3">
              <Label className="text-xs font-bold text-content-secondary uppercase tracking-wider">
                Price
              </Label>
              <OptionButtons
                options={priceOptions}
                selected={priceFilter}
                onSelect={(id) => handleFilterChange(setPriceFilter, id as PriceFilter)}
                variant="pricing"
                size="md"
                shape="pill"
              />
            </div>

            {/* Sort Option */}
            <div className="space-y-3">
              <Label className="text-xs font-bold text-content-secondary uppercase tracking-wider">
                Sort By
              </Label>
              <Select value={sortBy} onValueChange={(value) => handleFilterChange(setSortBy, value as SortOption)}>
                <SelectTrigger className="h-10 text-xs border-border/40 bg-card rounded-lg hover:border-primary/40 transition-colors focus:ring-primary/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.icon}
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Results Count */}
          <div className="flex items-center justify-between pt-2 border-t border-border/20">
            <p className="text-xs font-bold text-content-secondary uppercase tracking-wider">
              Results
            </p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">{filteredAndSortedTemplates.length}</span>
              <p className="text-xs text-content-secondary font-medium">
                {filteredAndSortedTemplates.length === 1 ? "template" : "templates"}
              </p>
            </div>
          </div>
        </div>

        {/* Close Filters Button on Mobile */}
        {showFilters && (
          <div className="lg:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(false)}
              className="w-full gap-2"
            >
              <X className="h-4 w-4" />
              Close Filters
            </Button>
          </div>
        )}
      </motion.div>

      {/* Templates Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {currentPage === 1 && isLoading ? (
          <TemplateSkeletonGrid count={12} />
        ) : filteredAndSortedTemplates.length === 0 ? (
          <Card className="border-dashed border-2 border-border/50 bg-gradient-to-br from-card to-muted/20">
            <CardContent className="py-20 text-center">
              {/* Animated empty state icon */}
              <motion.div
                animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="mb-6 inline-flex items-center justify-center"
              >
                <Store className="h-16 w-16 text-primary/30" />
              </motion.div>
              <h3 className="text-lg font-bold text-content mb-2">No templates found</h3>
              <p className="text-sm text-content-secondary mb-6 max-w-sm mx-auto">
                Try different keywords, or explore our full gallery with all channels and price points.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setChannelFilter("all");
                    setPriceFilter("all");
                    setSortBy("trending");
                  }}
                >
                  See All Templates
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedTemplates.map((tpl, idx) => (
                <motion.div
                  key={tpl.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <MarketplaceTemplateCard
                    template={tpl}
                    onInstall={() => {
                      if (!userApps.length) {
                        toast({
                          title: "No apps",
                          description: "Create an app first to install templates.",
                          variant: "destructive",
                        });
                        return;
                      }
                      setInstallTemplate(tpl);
                    }}
                    onPreview={() => setPreviewTemplate(tpl)}
                  />
                </motion.div>
              ))}
            </div>

            {/* Load More Section */}
            {hasMoreTemplates && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-4 py-6"
              >
                {isLoadingMore && <TemplateSkeletonGrid count={4} />}
                {!isLoadingMore && (
                  <Button
                    onClick={handleLoadMore}
                    variant="outline"
                    size="lg"
                    className="gap-2 px-8 h-11 rounded-xl border-primary/30 hover:border-primary/50 hover:bg-primary/5"
                    disabled={isLoadingMore}
                  >
                    <ChevronDown className="h-4 w-4" />
                    Load More Templates
                    <span className="text-xs font-medium ml-2 text-content-secondary">
                      ({filteredAndSortedTemplates.length} of {totalCount})
                    </span>
                  </Button>
                )}
              </motion.div>
            )}
          </div>
        )}
      </motion.div>

      {/* Install Dialog - Premium Design with Dark Mode */}
      <Dialog open={!!installTemplate} onOpenChange={(o) => !o && setInstallTemplate(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          {/* Header with accent line */}
          <div className="space-y-1 pb-4 border-b border-border/20 dark:border-border/40">
            <DialogHeader className="space-y-0">
              <div className="flex items-start gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-primary via-primary to-primary/50 rounded-full mt-0.5" />
                <div className="space-y-1 flex-1">
                  <DialogTitle className="text-xl font-bold text-content dark:text-white">
                    Install {installTemplate?.subject}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-content-secondary dark:text-foreground/70">
                    Choose where to install this template
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="space-y-5">
            {/* Pricing Badge */}
            {installTemplate?.price ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert className="bg-primary/8 dark:bg-primary/15 border-primary/30 dark:border-primary/40 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-primary dark:text-primary/90" />
                  <AlertDescription className="text-content dark:text-white font-medium">
                    Premium template • <span className="font-bold text-primary dark:text-primary/90 text-lg">${installTemplate.price}</span> one-time
                  </AlertDescription>
                </Alert>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert className="bg-green-500/8 dark:bg-green-500/15 border-green-500/30 dark:border-green-500/40 rounded-xl">
                  <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-content dark:text-white font-medium">
                    Free template • Ready to install immediately
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* App Selector */}
            <div className="space-y-2.5">
              <Label className="text-xs font-bold text-content-secondary dark:text-foreground/70 uppercase tracking-wider">
                Select Destination App
              </Label>
              {userApps.length === 0 ? (
                <Alert variant="destructive" className="rounded-xl dark:bg-red-500/15 dark:border-red-500/40">
                  <AlertCircle className="h-4 w-4 dark:text-red-400" />
                  <AlertDescription className="text-sm dark:text-red-300">
                    Create an app first, then install templates to it.
                  </AlertDescription>
                </Alert>
              ) : (
                <Select value={selectedAppId} onValueChange={setSelectedAppId}>
                  <SelectTrigger className="h-11 rounded-xl border-border/40 dark:border-border/50 bg-card dark:bg-slate-800 hover:border-primary/40 dark:hover:border-primary/50 transition-all focus:ring-primary/40 dark:text-white">
                    <SelectValue placeholder="Choose an app..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl dark:bg-slate-800 dark:border-border/50">
                    {userApps.map((app) => (
                      <SelectItem key={app.id} value={app.id} className="py-2 dark:text-white dark:focus:bg-slate-700">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span className="font-medium">{app.name}</span>
                          <span className="text-xs text-muted-foreground dark:text-foreground/60">({app.environment})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* What You Get - Features */}
            {installTemplate?.features && (
              <div className="space-y-2.5">
                <Label className="text-xs font-bold text-content-secondary dark:text-foreground/70 uppercase tracking-wider">
                  What's Included
                </Label>
                <div className="bg-surface-secondary/50 dark:bg-slate-800/50 border border-border/20 dark:border-border/40 rounded-xl p-4 space-y-2">
                  {installTemplate.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <div className="h-2 w-2 rounded-full bg-primary dark:bg-primary/90 mt-1.5 flex-shrink-0" />
                      <p className="text-sm text-content-secondary dark:text-foreground/75 font-medium">{feature}</p>
                    </div>
                  ))}
                  {installTemplate.features.length > 3 && (
                    <p className="text-xs text-content-secondary/60 dark:text-foreground/50 pt-1">
                      +{installTemplate.features.length - 3} more features
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-border/20 dark:border-border/40">
              <Button
                variant="outline"
                size="default"
                onClick={() => setInstallTemplate(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="premium-action"
                size="default"
                onClick={handleInstall}
                disabled={!selectedAppId || installMutation.isPending || userApps.length === 0}
                className="flex-1"
              >
                {installMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⚙️</span> Installing...
                  </span>
                ) : (
                  "Install Template"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog - Premium Design */}
      <MarketplaceTemplatePreviewDialog
        open={!!previewTemplate}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
        template={previewTemplate}
        onAction={(template) => setInstallTemplate(template)}
        variant="dashboard"
      />
    </div>
  );
}
