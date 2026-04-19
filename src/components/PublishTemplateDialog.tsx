import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { FormTextarea } from "@/components/ui/form-textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, CheckCircle2, AlertCircle, Image as ImageIcon, DollarSign } from "lucide-react";

interface PublishTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: {
    id: string;
    subject: string;
    description: string;
    channel: string;
    previewImage?: string | null;
    tags?: string[];
    category?: string;
    pricing?: "free" | "paid";
    price?: number | null;
  };
  onPublish: (data: PublishTemplateData) => Promise<void>;
  isLoading?: boolean;
}

export interface PublishTemplateData {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  previewImage?: File;
  previewImageUrl?: string;
  pricing?: "free" | "paid";
  price?: number;
}

// Frontend categories - automatically mapped to backend on send
const categories = [
  "Transactional",      // → TRANSACTIONAL
  "Marketing",          // → MARKETING
  "Authentication",     // → AUTH
  "Security",           // → AUTH
  "E-Commerce",         // → TRANSACTIONAL
  "Alerts",             // → NOTIFICATION
];

export function PublishTemplateDialog({
  open,
  onOpenChange,
  template,
  onPublish,
  isLoading,
}: PublishTemplateDialogProps) {
  const [step, setStep] = useState<"details" | "preview" | "review">("details");
  const [formData, setFormData] = useState<PublishTemplateData>({
    title: template?.subject || "",
    description: template?.description || "",
    category: "",
    tags: [],
    previewImageUrl: undefined,
    pricing: "free",
    price: 0,
  });
  const [tagInput, setTagInput] = useState("");
  const [previewError, setPreviewError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync form data when dialog opens or template changes
  useEffect(() => {
    if (open && template) {
      setFormData({
        title: template.subject || "",
        description: template.description || "",
        category: template.category || "",
        tags: (template.tags && template.tags.length > 0 && template.tags[0] !== "none") ? template.tags : [],
        previewImageUrl: template.previewImage || undefined,
        pricing: template.pricing || "free",
        price: template.price || 0,
      });
      setStep("details");
      setTagInput("");
      setPreviewError("");
    }
  }, [open, template?.id]);

  const requiredFields = [
    { name: "Title", field: "title", done: !!formData.title?.trim() },
    { name: "Description", field: "description", done: !!formData.description?.trim() },
    { name: "Category", field: "category", done: !!formData.category },
    { name: "Preview Image", field: "image", done: !!formData.previewImageUrl },
    { name: "At least 1 tag", field: "tags", done: (formData.tags?.length || 0) > 0 },
    {
      name: formData.pricing === "paid" ? `Price ($${formData.price || 0})` : "Pricing (Free)",
      field: "pricing",
      done: formData.pricing === "free" || (formData.pricing === "paid" && (formData.price || 0) > 0)
    },
  ];

  const allRequirementsMet = requiredFields.every((r) => r.done);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreviewError("");
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setPreviewError("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setPreviewError("Image must be smaller than 5MB");
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({
        ...prev,
        previewImage: file,
        previewImageUrl: event.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if ((formData.tags?.length || 0) >= 5) return;

    setFormData((prev) => ({
      ...prev,
      tags: [...(prev.tags || []), tagInput.trim()],
    }));
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((t) => t !== tag) || [],
    }));
  };

  const handlePublish = async () => {
    if (!allRequirementsMet) return;
    try {
      await onPublish(formData);
      onOpenChange(false);
      setStep("details");
      setFormData({
        title: template?.subject || "",
        description: template?.description || "",
        category: "",
        tags: [],
      });
    } catch (error) {
      // Error handled by parent
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        {/* Header Section with proper spacing */}
        <div className="space-y-4 pb-6 border-b border-border/20 dark:border-border/40 -mx-6 px-6 pt-6">
          <DialogHeader className="space-y-3">
            <div className="flex items-start gap-4">
              <div className="w-1.5 h-10 bg-gradient-to-b from-primary via-primary to-primary/50 rounded-full mt-0.5 flex-shrink-0" />
              <div className="space-y-2 flex-1 min-w-0">
                <DialogTitle className="text-2xl font-bold text-content dark:text-white leading-tight">
                  Publish to Marketplace
                </DialogTitle>
                <DialogDescription className="text-sm text-content-secondary dark:text-foreground/70 leading-relaxed">
                  Put your template in front of thousands of users. Once published, others can install, rate, and share it—and you gain recognition as a template creator.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8 px-0"
        >
          {/* Requirements Checklist & Live Preview Split */}
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6">
            {/* Requirements Checklist */}
            <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/40 rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary dark:text-primary/90 flex-shrink-0" />
                <p className="text-xs font-bold text-content dark:text-white uppercase tracking-widest">
                  Before You Publish
                </p>
              </div>

              <div className="space-y-3">
                {requiredFields.map((req, idx) => (
                  <motion.div
                    key={req.field}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div
                      className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-all ${
                        req.done
                          ? "bg-green-500/30 text-green-600 dark:text-green-400"
                          : "bg-slate-500/20 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {req.done ? "✓" : "○"}
                    </div>
                    <span className={`text-sm leading-tight ${req.done ? "text-content dark:text-white font-medium" : "text-content-secondary dark:text-foreground/70"}`}>
                      {req.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Live Preview Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-card dark:bg-slate-800 border border-border/40 dark:border-border/60 rounded-2xl p-6 space-y-4 h-fit"
            >
              <p className="text-xs font-bold text-content-secondary dark:text-foreground/70 uppercase tracking-widest">
                Marketplace Preview
              </p>

              {/* Preview Image */}
              <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800 aspect-video flex items-center justify-center border border-border/40 dark:border-border/60">
                {formData.previewImageUrl ? (
                  <img
                    src={formData.previewImageUrl}
                    alt="Template Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center py-8">
                    <ImageIcon className="h-8 w-8 text-content-secondary dark:text-foreground/50 mx-auto mb-2" />
                    <p className="text-xs text-content-secondary dark:text-foreground/60">
                      Upload preview image
                    </p>
                  </div>
                )}
              </div>

              {/* Template Title */}
              <div>
                <p className="text-xs font-semibold text-content-secondary dark:text-foreground/70 mb-2">TITLE</p>
                <p className="text-sm font-bold text-content dark:text-white line-clamp-2">
                  {formData.title || "Template Name"}
                </p>
              </div>

              {/* Category Badge */}
              {formData.category && (
                <div>
                  <p className="text-xs font-semibold text-content-secondary dark:text-foreground/70 mb-2">CATEGORY</p>
                  <Badge variant="secondary" className="bg-primary/15 text-primary dark:bg-primary/20 dark:text-primary/90 border-0">
                    {formData.category}
                  </Badge>
                </div>
              )}

              {/* Tags Preview */}
              {formData.tags && formData.tags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-content-secondary dark:text-foreground/70 mb-2">TAGS</p>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-[10px] bg-background/50 dark:bg-slate-700/50 border-border/60 dark:border-border/40 text-content dark:text-foreground/80"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing Display */}
              {formData.pricing && (
                <div className="pt-2 border-t border-border/40 dark:border-border/60">
                  <p className="text-xs font-semibold text-content-secondary dark:text-foreground/70 mb-2">PRICING</p>
                  <div className="flex items-center gap-2">
                    {formData.pricing === "free" ? (
                      <>
                        <div className="h-6 px-2.5 rounded-full bg-green-500/20 dark:bg-green-500/30 flex items-center">
                          <span className="text-xs font-bold text-green-700 dark:text-green-300">Free</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="h-6 px-2.5 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center">
                          <span className="text-xs font-bold text-primary dark:text-primary/90">
                            ${formData.price || 0}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Template Details Form */}
          <div className="space-y-6">
            {/* Title Field */}
            <FormInput
              label="Template Name"
              description="What users will see when browsing the marketplace"
              value={formData.title || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Professional Welcome Email"
              required
            />

            {/* Description Field */}
            <FormTextarea
              label="Tell Your Story"
              description="Why is this template valuable? What problem does it solve?"
              value={formData.description || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="e.g., Gets new users excited with personality and clear CTAs. Mobile-ready. Dark mode included."
              maxLength={200}
              showCharCount
              required
            />

            {/* Category Selection */}
            <div className="space-y-3">
              <Label className="text-xs font-bold text-content-secondary dark:text-foreground/70 uppercase tracking-widest">
                Best Fit Category *
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFormData((prev) => ({ ...prev, category: cat }))}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      formData.category === cat
                        ? "bg-primary text-white shadow-primary/30 ring-1 ring-primary"
                        : "bg-card dark:bg-slate-800 border border-border/40 dark:border-border/50 text-content dark:text-white hover:border-primary/50 dark:hover:border-primary/50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing Selection */}
            <div className="space-y-3">
              <Label className="text-xs font-bold text-content-secondary dark:text-foreground/70 uppercase tracking-widest">
                How to Offer It *
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFormData((prev) => ({ ...prev, pricing: "free", price: 0 }))}
                  className={`px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-200 border-2 ${
                    formData.pricing === "free"
                      ? "bg-green-500/15 border-green-500/40 text-green-700 dark:text-green-300 dark:bg-green-500/20 dark:border-green-500/50"
                      : "bg-card dark:bg-slate-800 border-border/40 dark:border-border/50 text-content dark:text-white hover:border-green-500/50 dark:hover:border-green-500/50"
                  }`}
                >
                  <div className="font-bold">Give it Away</div>
                  <div className="text-[10px] opacity-75">Build community</div>
                </button>

                <button
                  onClick={() => setFormData((prev) => ({ ...prev, pricing: "paid", price: 5 }))}
                  className={`px-4 py-3 rounded-xl text-xs font-semibold transition-all duration-200 border-2 ${
                    formData.pricing === "paid"
                      ? "bg-primary/15 border-primary/40 text-primary dark:text-primary dark:bg-primary/20 dark:border-primary/50"
                      : "bg-card dark:bg-slate-800 border-border/40 dark:border-border/50 text-content dark:text-white hover:border-primary/50 dark:hover:border-primary/50"
                  }`}
                >
                  <div className="font-bold">Premium</div>
                  <div className="text-[10px] opacity-75">Get paid</div>
                </button>
              </div>
            </div>

            {/* Price Input (show only if paid) */}
            {formData.pricing === "paid" && (
              <div className="space-y-3 p-5 bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/40 rounded-xl">
                <FormInput
                  label="Your Price"
                  description="What users pay when they install. Most templates: $5–$50."
                  type="number"
                  min="1"
                  max="999"
                  step="1"
                  value={formData.price || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                  placeholder="29"
                  icon={<DollarSign className="h-4 w-4" />}
                  iconPosition="left"
                  required
                />
              </div>
            )}

            {/* Tags Input */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-content-secondary dark:text-foreground/70 uppercase tracking-widest flex items-center gap-1.5">
                Tags (up to 5)
                <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-2.5">
                <FormInput
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  placeholder="e.g., welcome, onboarding, conversion"
                  disabled={(formData.tags?.length || 0) >= 5}
                  helperText="Press Enter or click Add to add a tag"
                  required={false}
                />
                <Button
                  onClick={handleAddTag}
                  variant="outline"
                  size="sm"
                  disabled={(formData.tags?.length || 0) >= 5}
                  className="h-11 rounded-xl px-6 font-semibold mt-auto"
                >
                  Add
                </Button>
              </div>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="px-3 py-1.5 bg-primary/15 text-primary dark:bg-primary/20 dark:text-primary/90 border-0 rounded-full"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1.5 hover:opacity-70 transition-opacity"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Preview Image Upload */}
            <div className="space-y-3">
              <Label className="text-xs font-bold text-content-secondary dark:text-foreground/70 uppercase tracking-widest">
                Preview Image *
              </Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative border-2 border-dashed border-border/40 dark:border-border/50 rounded-2xl p-8 text-center cursor-pointer hover:border-primary/50 dark:hover:border-primary/50 transition-colors bg-card/40 dark:bg-slate-800/40 group"
              >
                {formData.previewImageUrl ? (
                  <div className="space-y-3">
                    <img
                      src={formData.previewImageUrl}
                      alt="Preview"
                      className="h-40 w-full object-cover rounded-xl mx-auto shadow-sm"
                    />
                    <p className="text-xs text-content-secondary dark:text-foreground/70 font-medium">
                      Click to change image
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 py-2">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 dark:bg-primary/15 group-hover:bg-primary/15 dark:group-hover:bg-primary/20 transition-colors">
                      <ImageIcon className="h-6 w-6 text-primary dark:text-primary/90" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-content dark:text-white">
                        Upload preview image
                      </p>
                      <p className="text-xs text-content-secondary dark:text-foreground/70">
                        PNG or JPG • Max 5MB • Shows how your template looks
                      </p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              {previewError && (
                <Alert variant="destructive" className="rounded-xl border-destructive/30 bg-destructive/5 dark:bg-destructive/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">{previewError}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Publishing Tips */}
          <div className="bg-slate-500/5 dark:bg-slate-500/10 border border-slate-500/20 dark:border-slate-500/30 rounded-2xl p-5 space-y-3">
            <p className="text-xs font-semibold text-content-secondary dark:text-foreground/70 uppercase tracking-widest">
              💡 What Gets Discovered
            </p>
            <ul className="text-xs text-content-secondary dark:text-foreground/70 space-y-2">
              <li className="flex gap-2">
                <span className="text-primary dark:text-primary/90 font-bold flex-shrink-0">•</span>
                <span><strong>Specific names</strong> (not generic). Users search for "welcome email" not "email template"</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary dark:text-primary/90 font-bold flex-shrink-0">•</span>
                <span><strong>Professional images</strong>. Show your template in action, not just a blank mockup</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary dark:text-primary/90 font-bold flex-shrink-0">•</span>
                <span><strong>Relevant tags</strong>. Think like the user: what would you search for?</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary dark:text-primary/90 font-bold flex-shrink-0">•</span>
                <span><strong>Clear value prop.</strong> For premium templates: explain why it's worth the cost</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2 border-t border-border/20 dark:border-border/40">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 rounded-xl font-semibold"
              disabled={isLoading}
            >
              Save Draft
            </Button>
            <Button
              variant="premium-action"
              onClick={handlePublish}
              disabled={!allRequirementsMet || isLoading}
              className="flex-1 h-11 rounded-xl font-semibold gap-2"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">⚙️</span>
                  Publishing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Go Live
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
