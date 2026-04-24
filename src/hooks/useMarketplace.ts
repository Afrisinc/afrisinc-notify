import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listMarketplaceTemplatesService,
  getMarketplaceTemplateService,
  installMarketplaceTemplateService,
  rateMarketplaceTemplateService,
  getTemplateRatingService,
  getMarketplaceCategoriesService,
  type ListTemplatesParams,
  type InstallTemplatePayload,
  type RatingPayload,
} from "@/services/marketplace";

// ──────────────────────────────────────────
// LIST MARKETPLACE TEMPLATES
// ──────────────────────────────────────────

export function useMarketplaceTemplates(
  params?: ListTemplatesParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["marketplaceTemplates", params],
    queryFn: () => listMarketplaceTemplatesService(params),
    enabled: options?.enabled ?? true,
  });
}

// ──────────────────────────────────────────
// GET MARKETPLACE TEMPLATE DETAILS
// ──────────────────────────────────────────

export function useMarketplaceTemplate(
  templateId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["marketplaceTemplate", templateId],
    queryFn: () => getMarketplaceTemplateService(templateId),
    enabled: (options?.enabled ?? true) && !!templateId,
  });
}

// ──────────────────────────────────────────
// INSTALL MARKETPLACE TEMPLATE
// ──────────────────────────────────────────

export function useInstallMarketplaceTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      payload,
    }: {
      templateId: string;
      payload: InstallTemplatePayload;
    }) => installMarketplaceTemplateService(templateId, payload),
    onSuccess: (_data, { payload }) => {
      // Invalidate app templates list when a marketplace template is installed
      queryClient.invalidateQueries({
        queryKey: ["appTemplates", payload.appId],
      });
      // Also invalidate apps list to update template count
      queryClient.invalidateQueries({
        queryKey: ["apps"],
      });
    },
  });
}

// ──────────────────────────────────────────
// RATE MARKETPLACE TEMPLATE
// ──────────────────────────────────────────

export function useRateMarketplaceTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      payload,
    }: {
      templateId: string;
      payload: RatingPayload;
    }) => rateMarketplaceTemplateService(templateId, payload),
    onSuccess: (_data, { templateId }) => {
      // Invalidate template details to refresh rating
      queryClient.invalidateQueries({
        queryKey: ["marketplaceTemplate", templateId],
      });
      // Also invalidate user's rating for this template
      queryClient.invalidateQueries({
        queryKey: ["templateRating", templateId],
      });
    },
  });
}

// ──────────────────────────────────────────
// GET USER'S RATING FOR TEMPLATE
// ──────────────────────────────────────────

export function useTemplateRating(
  templateId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["templateRating", templateId],
    queryFn: () => getTemplateRatingService(templateId),
    enabled: (options?.enabled ?? true) && !!templateId,
  });
}

// ──────────────────────────────────────────
// GET MARKETPLACE CATEGORIES
// ──────────────────────────────────────────

export function useMarketplaceCategories(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["marketplaceCategories"],
    queryFn: () => getMarketplaceCategoriesService(),
    enabled: options?.enabled ?? true,
  });
}
