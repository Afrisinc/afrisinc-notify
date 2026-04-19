import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserTemplates, usePublishTemplate, useUnpublishTemplate } from "@/hooks/useUserTemplatePublishing";
import { useCurrentAccountId } from "@/hooks/useAuth";
import { useDeleteTemplate, useDuplicateTemplate } from "@/hooks/useTemplates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SelectFilter } from "@/components/ui/select-filter";
import { MyTemplateCard } from "@/components/MyTemplateCard";
import { MyTemplateSkeletonGrid } from "@/components/MyTemplateCardSkeleton";
import { PublishTemplateDialog, type PublishTemplateData } from "@/components/PublishTemplateDialog";
import { Plus, AlertCircle, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { SearchInput } from "@/components/ui/search-input";

type VisibilityFilter = "all" | "published" | "private";

export default function MyTemplates() {
  const navigate = useNavigate();
  const accountId = useCurrentAccountId();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("all");
  const [publishDialogId, setPublishDialogId] = useState<string | null>(null);
  const [unpublishDialog, setUnpublishDialog] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [duplicateDialog, setDuplicateDialog] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Fetch user templates
  const { data: templatesResponse, isLoading, error, refetch } = useUserTemplates(
    { limit: 10, offset: (page - 1) * 10 },
    { enabled: !!accountId }
  );

  // Mutations
  const publishMutation = usePublishTemplate();
  const unpublishMutation = useUnpublishTemplate();
  const deleteMutation = useDeleteTemplate();
  const duplicateMutation = useDuplicateTemplate();

  const templates = templatesResponse?.data || [];
  const meta = templatesResponse?.meta;
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 1;

  // Filter templates
  const filtered = templates.filter((t) => {
    if (visibilityFilter === "published" && !t.isPublic) return false;
    if (visibilityFilter === "private" && t.isPublic) return false;
    if (search && !t.code.toLowerCase().includes(search.toLowerCase()) && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selectedTemplate = templates.find((t) => t.id === publishDialogId);

  const handlePublish = async (data: PublishTemplateData) => {
    if (!publishDialogId) return;
    try {
      // Convert previewImageUrl (data URL) back to File for multipart upload
      let previewImageFile: File | undefined;
      if (data.previewImageUrl && data.previewImageUrl.startsWith("data:")) {
        const arr = data.previewImageUrl.split(",");
        const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
        const bstr = atob(arr[1]);
        const n = bstr.length;
        const u8arr = new Uint8Array(n);
        for (let i = 0; i < n; i++) {
          u8arr[i] = bstr.charCodeAt(i);
        }
        previewImageFile = new File([u8arr], "preview.png", { type: mime });
      }

      // Build FormData for multipart upload
      const formData = new FormData();
      formData.append("title", data.title || "");
      formData.append("description", data.description || "");
      formData.append("category", data.category || "");
      if (data.tags && data.tags.length > 0) {
        formData.append("tags", JSON.stringify(data.tags));
      }
      if (previewImageFile) {
        formData.append("previewImage", previewImageFile);
      }
      if (data.pricing) {
        formData.append("pricing", data.pricing);
      }
      if (data.price !== undefined) {
        formData.append("price", data.price.toString());
      }

      await publishMutation.mutateAsync({
        templateId: publishDialogId,
        payload: formData,
      });

      toast({
        title: "Success",
        description: "Template published to marketplace! It's now available for other users to discover.",
      });

      setPublishDialogId(null);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to publish template",
        variant: "destructive",
      });
    }
  };

  const handleUnpublish = async (templateId: string) => {
    try {
      await unpublishMutation.mutateAsync(templateId);

      toast({
        title: "Success",
        description: "Template removed from marketplace and made private",
      });

      setUnpublishDialog(null);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to unpublish template",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (templateId: string) => {
    try {
      await deleteMutation.mutateAsync(templateId);

      toast({
        title: "Success",
        description: "Template deleted successfully",
      });

      setDeleteDialog(null);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = async (templateId: string) => {
    try {
      const result = await duplicateMutation.mutateAsync({ templateId });

      toast({
        title: "Success",
        description: "Template duplicated. Redirecting to editor...",
      });

      setDuplicateDialog(null);
      refetch();

      if (result?.data?.id) {
        navigate(`/dashboard/templates/${result.data.id}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to duplicate template",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Header - Minimal & Professional */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-3"
      >
        <h1 className="text-3xl md:text-4xl font-black text-content dark:text-white tracking-tight">
          My Templates
        </h1>
        <p className="text-base text-content-secondary dark:text-foreground/70 max-w-2xl leading-relaxed">
          Your hub to build, manage, and monetize notification templates. Publish to the marketplace and earn recognition from thousands of users.
        </p>
      </motion.div>

      {/* Search & Filter Section - Proper spacing */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-5"
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search templates by name or description..."
            size="lg"
            className="lg:col-span-3"
            inputClassName="h-12"
          />

          <div className="flex gap-3 items-center flex-wrap lg:col-span-2">
            <SelectFilter
              value={visibilityFilter}
              onValueChange={(v) => setVisibilityFilter(v as VisibilityFilter)}
              placeholder="Filter"
              options={[
                { value: "all", label: "All Templates" },
                { value: "published", label: "Published" },
                { value: "private", label: "Private" },
              ]}
            />
            <Button
              onClick={() => navigate("/dashboard/templates/new")}
              className="gap-2 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-primary/30 px-6 font-semibold"
            >
              <Plus className="h-5 w-5" /> Create New
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Alert variant="destructive" className="rounded-2xl border-destructive/30 bg-destructive/5 dark:bg-destructive/10 px-6 py-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <AlertDescription className="text-sm font-medium">
              Failed to load templates. Please refresh the page or try again.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <MyTemplateSkeletonGrid count={6} />
      ) : filtered.length === 0 ? (
        /* Empty State - Editorial spacing */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="rounded-2xl border-2 border-dashed border-border/40 dark:border-border/30 bg-gradient-to-br from-card/50 to-muted/20 dark:from-slate-900/30 dark:to-slate-800/20 overflow-hidden">
            <CardContent className="py-20 px-8 text-center space-y-6">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-primary/10 dark:bg-primary/15">
                <Sparkles className="h-10 w-10 text-primary dark:text-primary/90" />
              </div>
              <div className="space-y-3 max-w-md mx-auto">
                <h3 className="text-2xl font-bold text-content dark:text-white leading-tight">
                  {templates.length === 0 ? "No templates yet" : "No results found"}
                </h3>
                <p className="text-base text-content-secondary dark:text-foreground/70 leading-relaxed">
                  {templates.length === 0
                    ? "Start by creating your first notification template. Once you publish it, it'll be discoverable in the marketplace."
                    : "Try adjusting your search terms or filters to find what you're looking for."}
                </p>
              </div>
              {templates.length === 0 && (
                <Button
                  onClick={() => navigate("/dashboard/templates/new")}
                  className="mt-2 gap-2 h-11 bg-primary hover:bg-primary/90 text-white shadow-primary/30 px-6 font-semibold rounded-xl"
                >
                  <Plus className="h-4 w-4" /> Create Your First Template
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* Templates Grid - Proper spacing and alignment */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((template, idx) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <MyTemplateCard
                  template={template}
                  onEdit={() => navigate(`/dashboard/templates/${template.id}`)}
                  onView={() => navigate(`/dashboard/templates/${template.id}`)}
                  onDuplicate={() => setDuplicateDialog(template.id)}
                  onDelete={() => setDeleteDialog(template.id)}
                  onPublish={() => setPublishDialogId(template.id)}
                  onUnpublish={() => setUnpublishDialog(template.id)}
                  isPublishing={publishMutation.isPending}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination - Proper spacing */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center items-center gap-6 pt-10 mt-8 border-t border-border/20 dark:border-border/40"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="h-11 rounded-xl px-6 font-semibold"
              >
                Previous
              </Button>
              <div className="flex items-center gap-3 px-6 py-2 bg-card/50 dark:bg-slate-800/50 rounded-xl border border-border/20 dark:border-border/40">
                <span className="text-xs font-bold text-content-secondary dark:text-foreground/60 uppercase tracking-wider">Page</span>
                <span className="text-base font-bold text-content dark:text-white">{page}</span>
                <span className="text-xs font-bold text-content-secondary dark:text-foreground/60">of</span>
                <span className="text-base font-bold text-content dark:text-white">{totalPages}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="h-11 rounded-xl px-6 font-semibold"
              >
                Next
              </Button>
            </motion.div>
          )}
        </>
      )}

      {/* Publish Template Dialog - Professional Flow */}
      <PublishTemplateDialog
        open={!!publishDialogId}
        onOpenChange={(open) => !open && setPublishDialogId(null)}
        template={selectedTemplate}
        onPublish={handlePublish}
        isLoading={publishMutation.isPending}
      />

      {/* Unpublish Dialog */}
      <ConfirmDialog
        open={!!unpublishDialog}
        onOpenChange={(open) => !open && setUnpublishDialog(null)}
        title="Unpublish Template"
        description="Remove this template from the marketplace"
        variant="warning"
        message="⚠ This action will:"
        items={[
          "Remove your template from marketplace search",
          "Disable new installations",
          "Preserve your template privately",
          "Keep ratings in history",
        ]}
        confirmText="Unpublish Template"
        cancelText="Keep Published"
        isLoading={unpublishMutation.isPending}
        onConfirm={() => unpublishDialog && handleUnpublish(unpublishDialog)}
        onCancel={() => setUnpublishDialog(null)}
        confirmVariant="destructive"
      />

      {/* Duplicate Dialog */}
      <ConfirmDialog
        open={!!duplicateDialog}
        onOpenChange={(open) => !open && setDuplicateDialog(null)}
        title="Duplicate Template"
        description="Create a complete copy to modify independently"
        variant="info"
        message="✓ Your duplicate will include:"
        items={[
          "All template content and design",
          "Complete settings and variables",
          "Private status (ready to customize)",
          "Fresh copy ready to edit",
        ]}
        confirmText="Duplicate Template"
        cancelText="Cancel"
        isLoading={duplicateMutation.isPending}
        onConfirm={() => duplicateDialog && handleDuplicate(duplicateDialog)}
        onCancel={() => setDuplicateDialog(null)}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        open={!!deleteDialog}
        onOpenChange={(open) => !open && setDeleteDialog(null)}
        title="Delete Template"
        description="This action cannot be undone. Deleted templates cannot be recovered."
        variant="danger"
        message="⚠ Are you sure you want to delete?"
        items={[
          "Template will be permanently deleted",
          "All versions and history removed",
          "This cannot be recovered",
        ]}
        confirmText="Delete Template"
        cancelText="Cancel"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteDialog && handleDelete(deleteDialog)}
        onCancel={() => setDeleteDialog(null)}
        confirmVariant="destructive"
      />
    </div>
  );
}
