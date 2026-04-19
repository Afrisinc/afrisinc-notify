import getApiClient from "./apiClient";

// ──────────────────────────────────────────
// USER TEMPLATE PUBLISHING TYPES
// ──────────────────────────────────────────

export interface UserTemplate {
  id: string;
  code?: string;
  slug?: string;
  name?: string;
  channel: "EMAIL" | "SMS" | "PUSH" | "IN_APP";
  category?: "MARKETING" | "TRANSACTIONAL" | "AUTHENTICATION" | "ALERTS";
  subject?: string;
  description: string;
  language?: string;
  version?: number;
  active?: boolean;
  visibility?: "private" | "marketplace";
  isPublic?: boolean;
  rating?: number;
  ratingCount?: number;
  installs?: number;
  author?: string;
  isFree?: boolean;
  variables?: string[];
  content?: {
    email?: {
      subject?: string;
      html?: string;
    };
  };
  designJson?: any;
  editorType?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListUserTemplatesParams {
  limit?: number;
  offset?: number;
}

export interface ListUserTemplatesResponse {
  data: UserTemplate[];
  meta: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface PublishTemplatePayload {
  // Core metadata
  title?: string;
  description?: string;
  category?: string; // Frontend category names: "Transactional", "Marketing", "Authentication", etc.

  // Marketplace presentation
  tags?: string[];
  previewImageUrl?: string; // Can be data URL string or will be converted to File
  previewImage?: File; // For multipart uploads
  thumbnail?: string;

  // Pricing
  pricing?: "free" | "paid";
  price?: number;
}

export interface PublishTemplateResponse {
  id: string;
  code: string;
  channel: string;
  visibility: "marketplace";
  isPublic: true;
  title?: string;
  category?: string;
  tags?: string[];
  pricing?: "free" | "paid";
  price?: number;
  publishedAt: string;
}

export interface UnpublishTemplateResponse {
  id: string;
  code: string;
  visibility: "private";
  isPublic: false;
}

export interface CreateUserTemplatePayload {
  code: string;
  slug: string;
  channel: "EMAIL" | "SMS" | "PUSH" | "IN_APP";
  subject?: string;
  content: string;
  language?: string;
  description: string;
  design_json?: any;
  editor_type?: string;
}

export interface CreateUserTemplateResponse {
  id: string;
  code: string;
  channel: string;
  active: boolean;
}

// ──────────────────────────────────────────
// LIST USER TEMPLATES
// ──────────────────────────────────────────

export const listUserTemplatesService = async (
  accountId: string,
  params?: ListUserTemplatesParams
) => {
  const queryParams = new URLSearchParams();

  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.offset) queryParams.append("offset", params.offset.toString());

  const query = queryParams.toString() ? `?${queryParams.toString()}` : "";

  const config = { headers: { "x-account-id": accountId } };
  const { data } = await getApiClient().get<any>(
    `/api/templates/my-templates${query}`,
    config
  );
  return {
    data: data.data,
    meta: data.meta,
  } as ListUserTemplatesResponse;
};

// ──────────────────────────────────────────
// GET USER TEMPLATE FOR EDITING
// ──────────────────────────────────────────

export const getUserTemplateForEditingService = async (
  templateId: string,
  accountId: string
) => {
  const config = { headers: { "x-account-id": accountId } };
  const { data } = await getApiClient().get<any>(
    `/api/templates/${templateId}/edit`,
    config
  );
  return data.data as UserTemplate;
};

// ──────────────────────────────────────────
// PUBLISH TEMPLATE TO MARKETPLACE
// ──────────────────────────────────────────

// Category mapping: Frontend -> Backend
const categoryMap: Record<string, string> = {
  "Transactional": "TRANSACTIONAL",
  "Marketing": "MARKETING",
  "Authentication": "AUTH",
  "Security": "AUTH",
  "E-Commerce": "TRANSACTIONAL",
  "Alerts": "NOTIFICATION",
};

export const publishTemplateService = async (
  templateId: string,
  accountId: string,
  payload?: PublishTemplatePayload | FormData
) => {
  const config = {
    headers: {
      "x-account-id": accountId,
    }
  };

  console.log("🚀 Publishing template with payload:", {
    templateId,
    accountId,
    payload
  });

  let requestPayload: any;

  // Check if payload is FormData (multipart file upload)
  if (payload instanceof FormData) {
    // Send FormData as-is, axios will set proper Content-Type: multipart/form-data
    requestPayload = payload;
    console.log("📤 Publishing template (multipart with file upload):", {
      templateId,
      hasFile: payload.has("previewImage"),
    });
  } else {
    // Build JSON payload for data URLs
    requestPayload = {};

    if (payload?.title) requestPayload.title = payload.title;
    if (payload?.description) requestPayload.description = payload.description;
    if (payload?.category) requestPayload.category = categoryMap[payload.category] || payload.category;
    if (payload?.tags) requestPayload.tags = payload.tags;

    // Use previewImageUrl string for data URLs
    if (payload?.previewImageUrl) {
      requestPayload.previewImage = payload.previewImageUrl;
    }

    if (payload?.pricing) requestPayload.pricing = payload.pricing;
    if (payload?.price !== undefined) requestPayload.price = payload.price;

    // Set JSON content type for non-multipart
    config.headers["Content-Type"] = "application/json";

    console.log("📤 Publishing template (JSON):", {
      templateId,
      payloadKeys: Object.keys(requestPayload),
      pricing: requestPayload.pricing,
      price: requestPayload.price,
    });
  }

  const { data } = await getApiClient().post<any>(
    `/api/templates/${templateId}/publish`,
    requestPayload,
    config
  );
  return data.data as PublishTemplateResponse;
};

// ──────────────────────────────────────────
// CREATE USER TEMPLATE
// ──────────────────────────────────────────

export const createUserTemplateService = async (
  accountId: string,
  payload: CreateUserTemplatePayload
) => {
  const config = { headers: { "x-account-id": accountId } };
  const { data } = await getApiClient().post<any>(
    `/api/templates`,
    payload,
    config
  );
  return data.data as CreateUserTemplateResponse;
};

// ──────────────────────────────────────────
// UPDATE USER TEMPLATE
// ──────────────────────────────────────────

export const updateUserTemplateService = async (
  templateId: string,
  accountId: string,
  payload: CreateUserTemplatePayload
) => {
  const config = { headers: { "x-account-id": accountId } };
  const { data } = await getApiClient().put<any>(
    `/api/templates/${templateId}`,
    payload,
    config
  );
  return data.data as CreateUserTemplateResponse;
};

// ──────────────────────────────────────────
// UNPUBLISH TEMPLATE FROM MARKETPLACE
// ──────────────────────────────────────────

export const unpublishTemplateService = async (
  templateId: string,
  accountId: string
) => {
  const config = { headers: { "x-account-id": accountId } };
  const { data } = await getApiClient().put<any>(
    `/api/templates/${templateId}/unpublish`,
    {},
    config
  );
  return data.data as UnpublishTemplateResponse;
};
