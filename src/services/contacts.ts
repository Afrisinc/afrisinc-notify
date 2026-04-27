import getApiClient from "./apiClient";

// ──────────────────────────────────────────
// CONTACT DATA TYPES
// ──────────────────────────────────────────

export interface Contact {
  id: string;
  appId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status: "active" | "inactive" | "unsubscribed";
  subscribed: boolean;
  tags: string[];
  attributes: Record<string, any>;
  notificationCount: number;
  lastNotificationSent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactPayload {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: "active" | "inactive" | "unsubscribed";
  subscribed?: boolean;
  tags?: string[];
  attributes?: Record<string, any>;
}

export interface ListContactsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "inactive" | "unsubscribed";
  tags?: string | string[];
  subscribed?: boolean;
}

export interface ListContactsResponse {
  appId: string;
  contacts: Contact[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BulkImportPayload {
  contacts: CreateContactPayload[];
  tags?: string[];
  updateIfExists?: boolean;
}

export interface BulkImportResponse {
  imported: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: Array<{
    row: number;
    email: string;
    reason: string;
  }>;
  createdIds: string[];
  importedAt: string;
}

export interface SearchContactsParams {
  q: string;
  fields?: string | string[];
  limit?: number;
}

export interface SearchContactsResponse {
  results: Contact[];
  total: number;
  query: string;
}

export interface ExportContactsParams {
  format?: "csv" | "json";
  status?: "active" | "inactive" | "unsubscribed";
  tags?: string | string[];
  fields?: string | string[];
}

// ──────────────────────────────────────────
// LIST CONTACTS
// ──────────────────────────────────────────

export const listContactsService = async (
  appId: string,
  params?: ListContactsParams,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.tags) {
    const tagsStr = Array.isArray(params.tags)
      ? params.tags.join(",")
      : params.tags;
    queryParams.append("tags", tagsStr);
  }
  if (params?.subscribed !== undefined)
    queryParams.append("subscribed", String(params.subscribed));

  const query = queryParams.toString() ? `?${queryParams.toString()}` : "";

  const { data } = await getApiClient().get<any>(
    `/api/apps/${appId}/contacts${query}`,
    config,
  );
  return data.data as ListContactsResponse;
};

// ──────────────────────────────────────────
// CREATE CONTACT
// ──────────────────────────────────────────

export const createContactService = async (
  appId: string,
  payload: CreateContactPayload,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const { data } = await getApiClient().post<any>(
    `/api/apps/${appId}/contacts`,
    payload,
    config,
  );
  return data.data as Contact;
};

// ──────────────────────────────────────────
// GET SINGLE CONTACT
// ──────────────────────────────────────────

export const getContactService = async (
  appId: string,
  contactId: string,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const { data } = await getApiClient().get<any>(
    `/api/apps/${appId}/contacts/${contactId}`,
    config,
  );
  return data.data as Contact;
};

// ──────────────────────────────────────────
// UPDATE CONTACT
// ──────────────────────────────────────────

export const updateContactService = async (
  appId: string,
  contactId: string,
  payload: Partial<CreateContactPayload>,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const { data } = await getApiClient().put<any>(
    `/api/apps/${appId}/contacts/${contactId}`,
    payload,
    config,
  );
  return data.data as Contact;
};

// ──────────────────────────────────────────
// DELETE CONTACT
// ──────────────────────────────────────────

export const deleteContactService = async (
  appId: string,
  contactId: string,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const { data } = await getApiClient().delete<any>(
    `/api/apps/${appId}/contacts/${contactId}`,
    config,
  );
  return data.data;
};

// ──────────────────────────────────────────
// BULK IMPORT CONTACTS
// ──────────────────────────────────────────

export const bulkImportContactsService = async (
  appId: string,
  payload: BulkImportPayload,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const { data } = await getApiClient().post<any>(
    `/api/apps/${appId}/contacts/import`,
    payload,
    config,
  );
  return data.data as BulkImportResponse;
};

// ──────────────────────────────────────────
// EXPORT CONTACTS
// ──────────────────────────────────────────

export const exportContactsService = async (
  appId: string,
  params?: ExportContactsParams,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const queryParams = new URLSearchParams();

  if (params?.format) queryParams.append("format", params.format);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.tags) {
    const tagsStr = Array.isArray(params.tags)
      ? params.tags.join(",")
      : params.tags;
    queryParams.append("tags", tagsStr);
  }
  if (params?.fields) {
    const fieldsStr = Array.isArray(params.fields)
      ? params.fields.join(",")
      : params.fields;
    queryParams.append("fields", fieldsStr);
  }

  const query = queryParams.toString() ? `?${queryParams.toString()}` : "";

  const response = await getApiClient().get(
    `/api/apps/${appId}/contacts/export${query}`,
    {
      ...config,
      responseType: "blob",
    },
  );

  return response.data;
};

// ──────────────────────────────────────────
// SEARCH CONTACTS
// ──────────────────────────────────────────

export const searchContactsService = async (
  appId: string,
  params: SearchContactsParams,
  accountId?: string,
) => {
  const config = accountId ? { headers: { "x-account-id": accountId } } : {};
  const queryParams = new URLSearchParams();

  queryParams.append("q", params.q);
  if (params?.fields) {
    const fieldsStr = Array.isArray(params.fields)
      ? params.fields.join(",")
      : params.fields;
    queryParams.append("fields", fieldsStr);
  }
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const query = queryParams.toString() ? `?${queryParams.toString()}` : "";

  const { data } = await getApiClient().get<any>(
    `/api/apps/${appId}/contacts/search${query}`,
    config,
  );
  return data.data as SearchContactsResponse;
};
