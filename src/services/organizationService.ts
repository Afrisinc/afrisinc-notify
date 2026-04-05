import getApiClient from "./apiClient";

// ──────────────────────────────────────────
// ORGANIZATION TYPES
// ──────────────────────────────────────────

export interface CreateOrganizationPayload {
  name: string;
  description?: string;
}

export interface UpdateOrganizationPayload {
  name?: string;
  legal_name?: string;
  country?: string;
  org_email?: string;
  org_phone?: string;
  location?: string;
}

export interface CreateInvitePayload {
  email: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
}

export interface InviteDetails {
  id: string;
  email: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  organizationId: string;
  organizationName: string;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  accepted: boolean;
}

export interface OrganizationMember {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  joinedAt: string;
}

export interface OrganizationMembersResponse {
  orgId: string;
  members: OrganizationMember[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ──────────────────────────────────────────
// ORGANIZATION SERVICES
// ──────────────────────────────────────────

/**
 * Create a new organization
 */
export const createOrganizationService = async (payload: CreateOrganizationPayload) => {
  const { data } = await getApiClient().post(`/api/organizations`, payload);
  return data.data;
};

/**
 * Get organization details by ID
 */
export const getOrganizationService = async (orgId: string) => {
  const { data } = await getApiClient().get(`/api/organizations/${orgId}`);
  return data.data;
};

/**
 * Update organization details
 * Only the organization owner can update
 */
export const updateOrganizationService = async (orgId: string, payload: UpdateOrganizationPayload) => {
  const { data } = await getApiClient().put(`/api/organizations/${orgId}`, payload);
  return data.data;
};

/**
 * Delete organization
 * Only the organization owner can delete
 * WARNING: This action is permanent and irreversible
 */
export const deleteOrganizationService = async (orgId: string) => {
  const { data } = await getApiClient().delete(`/api/organizations/${orgId}`);
  return data.data;
};

/**
 * Create organization invite
 * Send an invite to a user to join the organization
 * Only admins and owners can create invites
 */
export const createOrganizationInviteService = async (orgId: string, payload: CreateInvitePayload) => {
  const { data } = await getApiClient().post(`/api/organizations/${orgId}/invites`, payload, {
    headers: {
      'x-account-id': orgId,
    },
  });
  return data.data;
};

/**
 * Get organization members
 * Any member can view the member list with pagination
 */
export const getOrganizationMembersService = async (orgId: string, page: number = 1, limit: number = 10) => {
  const { data } = await getApiClient().get(`/api/organizations/${orgId}/members`, {
    params: { page, limit },
  });
  return data.data as OrganizationMembersResponse;
};

/**
 * Remove organization member
 * Only admins and owners can remove members
 * Cannot remove yourself
 */
export const removeOrganizationMemberService = async (orgId: string, memberId: string) => {
  const { data } = await getApiClient().delete(`/api/organizations/${orgId}/members/${memberId}`);
  return data.data;
};

// ──────────────────────────────────────────
// INVITE SERVICES
// ──────────────────────────────────────────

/**
 * Get invite details by inviteId and token
 * No authentication required
 */
export const getInviteDetailsService = async (inviteId: string, token: string) => {
  const { data } = await getApiClient().get(`/api/invites/${inviteId}/${token}`);
  return data.data as InviteDetails;
};

/**
 * Accept organization invite
 * Authentication required - user email must match invite email
 */
export const acceptInviteService = async (inviteId: string, token: string) => {
  const { data } = await getApiClient().post(`/api/invites/${inviteId}/${token}/accept`);
  return data.data;
};
