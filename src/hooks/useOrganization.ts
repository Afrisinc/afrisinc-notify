import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createOrganizationService,
  getOrganizationService,
  updateOrganizationService,
  deleteOrganizationService,
  createOrganizationInviteService,
  getOrganizationMembersService,
  getOrganizationInvitesService,
  getUserInvitesService,
  removeOrganizationMemberService,
  getInviteDetailsService,
  acceptInviteService,
  declineInviteService,
  type CreateOrganizationPayload,
  type UpdateOrganizationPayload,
  type CreateInvitePayload,
  type InviteDetails,
} from "@/services/organizationService";

/**
 * Create a new organization
 * Automatically refetches organizations list after creation
 */
export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrganizationPayload) => createOrganizationService(payload),
    onSuccess: () => {
      // Invalidate and immediately refetch user organizations
      queryClient.invalidateQueries({
        queryKey: ["userOrganizations"],
      });
      // Also refetch to ensure we get fresh data
      queryClient.refetchQueries({
        queryKey: ["userOrganizations"],
      });
    },
  });
}

/**
 * Get organization by ID
 */
export function useGetOrganization(orgId: string) {
  return useQuery({
    queryKey: ["organization", orgId],
    queryFn: () => getOrganizationService(orgId),
    enabled: !!orgId,
  });
}

/**
 * Update organization details
 * Only owner can update
 */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, payload }: { orgId: string; payload: UpdateOrganizationPayload }) =>
      updateOrganizationService(orgId, payload),
    onSuccess: (_data, { orgId }) => {
      // Invalidate organization queries
      queryClient.invalidateQueries({
        queryKey: ["organization", orgId],
      });
    },
  });
}

/**
 * Delete organization
 * Only owner can delete - WARNING: Irreversible action
 */
export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orgId: string) => deleteOrganizationService(orgId),
    onSuccess: () => {
      // Invalidate all organization queries
      queryClient.invalidateQueries({
        queryKey: ["organizations"],
      });
    },
  });
}

/**
 * Create organization invite
 * Send invite to join organization
 * Only admins and owners can invite
 */
export function useCreateOrganizationInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, accountId, payload }: { orgId: string; accountId: string; payload: CreateInvitePayload }) =>
      createOrganizationInviteService(orgId, accountId, payload),
    onSuccess: (_data, { orgId }) => {
      // Invalidate organization invites
      queryClient.invalidateQueries({
        queryKey: ["organizationInvites", orgId],
      });
    },
  });
}

/**
 * Get organization members with pagination
 * Any member can view member list
 */
export function useOrganizationMembers(orgId: string, page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ["organizationMembers", orgId, page, limit],
    queryFn: () => getOrganizationMembersService(orgId, page, limit),
    enabled: !!orgId && orgId !== "personal",
  });
}

/**
 * Get organization invites with pagination
 * Any member can view the pending invites
 */
export function useOrganizationInvites(orgId: string, page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ["organizationInvites", orgId, page, limit],
    queryFn: () => getOrganizationInvitesService(orgId, page, limit),
    enabled: !!orgId && orgId !== "personal",
  });
}

/**
 * Get all pending invites for the logged in user
 */
export function useUserInvites() {
  return useQuery({
    queryKey: ["userInvites"],
    queryFn: () => getUserInvitesService(),
  });
}

/**
 * Remove organization member
 * Only admins and owners can remove
 * Cannot remove yourself
 */
export function useRemoveOrganizationMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, memberId }: { orgId: string; memberId: string }) =>
      removeOrganizationMemberService(orgId, memberId),
    onSuccess: (_data, { orgId }) => {
      // Invalidate members list
      queryClient.invalidateQueries({
        queryKey: ["organizationMembers", orgId],
      });
    },
  });
}

// ──────────────────────────────────────────
// INVITE HOOKS
// ──────────────────────────────────────────

/**
 * Get invite details by inviteId and token
 * No authentication required
 */
export function useInviteDetails(inviteId: string, token: string) {
  return useQuery({
    queryKey: ["inviteDetails", inviteId, token],
    queryFn: () => getInviteDetailsService(inviteId, token),
    enabled: !!inviteId && !!token,
  });
}

/**
 * Accept organization invite
 * Authentication required - user email must match invite email
 */
export function useAcceptInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inviteId, token }: { inviteId: string; token: string }) =>
      acceptInviteService(inviteId, token),
    onSuccess: (_data, { inviteId, token }) => {
      // Invalidate invite details
      queryClient.invalidateQueries({
        queryKey: ["inviteDetails", inviteId, token],
      });
      // Invalidate organization queries to refresh member list
      queryClient.invalidateQueries({
        queryKey: ["organizations"],
      });
      // Invalidate user invites so the list clears the accepted one
      queryClient.invalidateQueries({
        queryKey: ["userInvites"],
      });
// Invalidate user organizations so the new org shows up for the user immediately
      queryClient.invalidateQueries({
        queryKey: ["userOrganizations"],
      });
    },
  });
}

/**
 * Decline organization invite
 * Authentication required - user email must match invite email
 */
export function useDeclineInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inviteId, token }: { inviteId: string; token: string }) =>
      declineInviteService(inviteId, token),
    onSuccess: (_data, { inviteId, token }) => {
      // Invalidate user invites so the list clears the declined one
      queryClient.invalidateQueries({
        queryKey: ["userInvites"],
      });
      // General cache refresh for the specific invite
      queryClient.invalidateQueries({
        queryKey: ["inviteDetails", inviteId, token],
      });
    },
  });
}
