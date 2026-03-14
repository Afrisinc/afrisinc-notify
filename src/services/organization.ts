import getApiClient from "./apiClient";

export interface OrganizationApp {
  id: string;
  account_id: string;
  name: string;
  environment: "development" | "staging" | "production";
  api_key: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  templateCount: number;
  notificationsSent: number;
  apiKeyCount: number;
}

/**
 * Get all apps for an organization
 */
export const getOrganizationAppsService = async (orgId: string) => {
  const { data } = await getApiClient().get(`/api/organizations/${orgId}/apps`);
  return data;
};

/**
 * Get all templates for an organization
 * GET /api/organizations/:orgId/templates
 */
export const getOrganizationTemplatesService = async (orgId: string, params?: {
  limit?: number;
  offset?: number;
  channel?: string;
  status?: string;
}) => {
  const { data } = await getApiClient().get(`/api/organizations/${orgId}/templates`, { params });
  return data;
};

/**
 * Get organization details
 */
export const getOrganizationService = async (orgId: string) => {
  const { data } = await getApiClient().get(`/api/organizations/${orgId}`);
  return data;
};

/**
 * Update organization
 */
export const updateOrganizationService = async (
  orgId: string,
  payload: { name?: string; slug?: string; [key: string]: any }
) => {
  const { data } = await getApiClient().put(`/api/organizations/${orgId}`, payload);
  return data;
};

/**
 * Delete organization
 */
export const deleteOrganizationService = async (orgId: string) => {
  const { data } = await getApiClient().delete(`/api/organizations/${orgId}`);
  return data;
};
