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
import { useCurrentAccountId } from "./useAuth";

// ──────────────────────────────────────────
// LIST USER TEMPLATES
// ──────────────────────────────────────────

export function useUserTemplates(
  params?: ListUserTemplatesParams,
  options?: { enabled?: boolean },
) {
  const accountId = useCurrentAccountId();

  return useQuery({
    queryKey: ["userTemplates", accountId, params],
    queryFn: () => listUserTemplatesService(accountId ?? "", params),
    enabled: (options?.enabled ?? true) && !!accountId,
  });
}

// ──────────────────────────────────────────
// CREATE USER TEMPLATE
// ──────────────────────────────────────────

export function useCreateUserTemplate() {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserTemplatePayload) =>
      createUserTemplateService(accountId ?? "", payload),
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
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      payload,
    }: {
      templateId: string;
      payload: CreateUserTemplatePayload;
    }) => updateUserTemplateService(templateId, accountId ?? "", payload),
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
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      templateId,
      payload,
    }: {
      templateId: string;
      payload?: PublishTemplatePayload;
    }) => publishTemplateService(templateId, accountId ?? "", payload),
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
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) =>
      unpublishTemplateService(templateId, accountId ?? ""),
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
