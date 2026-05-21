import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listUserTemplatesService,
  createUserTemplateService,
  updateUserTemplateService,
  publishTemplateService,
  unpublishTemplateService,
  type ListUserTemplatesParams,
  type PublishTemplatePayload,
  type CreateUserTemplatePayload,
} from "@/services/userTemplatePublishing";
import { useOrg } from "@/contexts/OrgContext";

// ──────────────────────────────────────────
// LIST USER TEMPLATES
// ──────────────────────────────────────────

export function useUserTemplates(
  params?: ListUserTemplatesParams,
  options?: { enabled?: boolean },
) {
  const { currentOrg } = useOrg();
  const orgId = currentOrg?.id ?? "";

  return useQuery({
    queryKey: ["userTemplates", orgId, params],
    queryFn: () => listUserTemplatesService(orgId, params),
    enabled: (options?.enabled ?? true) && !!orgId,
  });
}

// ──────────────────────────────────────────
// CREATE USER TEMPLATE
// ──────────────────────────────────────────

export function useCreateUserTemplate() {
  const { currentOrg } = useOrg();
  const orgId = currentOrg?.id ?? "";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserTemplatePayload) =>
      createUserTemplateService(orgId, payload),
    onSuccess: () => {
      // Invalidate user templates list to refresh with new template
      queryClient.invalidateQueries({
        queryKey: ["userTemplates"],
      });
    },
  });
}

// ──────────────────────────────────────────
// UPDATE USER TEMPLATE
// ──────────────────────────────────────────

export function useUpdateUserTemplate() {
  const { currentOrg } = useOrg();
  const orgId = currentOrg?.id ?? "";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      payload,
    }: {
      templateId: string;
      payload: CreateUserTemplatePayload;
    }) => updateUserTemplateService(orgId, templateId, payload),
    onSuccess: () => {
      // Invalidate user templates list to refresh with updated template
      queryClient.invalidateQueries({
        queryKey: ["userTemplates"],
      });
    },
  });
}

// ──────────────────────────────────────────
// PUBLISH TEMPLATE TO MARKETPLACE
// ──────────────────────────────────────────

export function usePublishTemplate() {
  const { currentOrg } = useOrg();
  const orgId = currentOrg?.id ?? "";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      payload,
    }: {
      templateId: string;
      payload?: PublishTemplatePayload;
    }) => publishTemplateService(orgId, templateId, payload),
    onSuccess: () => {
      // Invalidate user templates list to refresh status
      queryClient.invalidateQueries({
        queryKey: ["userTemplates"],
      });
      // Also invalidate marketplace templates as new template becomes available
      queryClient.invalidateQueries({
        queryKey: ["marketplaceTemplates"],
      });
    },
  });
}

// ──────────────────────────────────────────
// UNPUBLISH TEMPLATE FROM MARKETPLACE
// ──────────────────────────────────────────

export function useUnpublishTemplate() {
  const { currentOrg } = useOrg();
  const orgId = currentOrg?.id ?? "";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) =>
      unpublishTemplateService(orgId, templateId),
    onSuccess: () => {
      // Invalidate user templates list to refresh status
      queryClient.invalidateQueries({
        queryKey: ["userTemplates"],
      });
      // Also invalidate marketplace templates as template is removed
      queryClient.invalidateQueries({
        queryKey: ["marketplaceTemplates"],
      });
    },
  });
}
