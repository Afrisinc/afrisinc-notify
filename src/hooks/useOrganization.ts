import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getOrganizationAppsService,
  getOrganizationTemplatesService,
  getOrganizationService,
  updateOrganizationService,
  deleteOrganizationService,
} from "@/services/organization";

/**
 * Get all apps for an organization
 */
export function useOrganizationApps(orgId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["organizationApps", orgId],
    queryFn: () => getOrganizationAppsService(orgId),
    enabled: (options?.enabled ?? true) && !!orgId,
  });
}

/**
 * Get all templates for an organization
 */
export function useOrganizationTemplates(
  orgId: string,
  params?: { limit?: number; offset?: number; channel?: string; status?: string },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["organizationTemplates", orgId, params],
    queryFn: () => getOrganizationTemplatesService(orgId, params),
    enabled: (options?.enabled ?? true) && !!orgId,
  });
}

/**
 * Get organization details
 */
export function useOrganization(orgId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["organization", orgId],
    queryFn: () => getOrganizationService(orgId),
    enabled: (options?.enabled ?? true) && !!orgId,
  });
}

/**
 * Update organization
 */
export function useUpdateOrganization() {
  return useMutation({
    mutationFn: ({ orgId, payload }: { orgId: string; payload: Record<string, any> }) =>
      updateOrganizationService(orgId, payload),
  });
}

/**
 * Delete organization
 */
export function useDeleteOrganization() {
  return useMutation({
    mutationFn: (orgId: string) => deleteOrganizationService(orgId),
  });
}
