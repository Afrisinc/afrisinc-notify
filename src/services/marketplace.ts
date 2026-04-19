import getApiClient from "./apiClient";

// ──────────────────────────────────────────
// MARKETPLACE DATA TYPES
// ──────────────────────────────────────────

export interface MarketplaceVariable {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  required: boolean;
  description: string;
  default?: any;
  format?: string;
}

export interface MarketplaceCreator {
  id: string;
  name: string;
  avatar: string;
  bio?: string;
}

export interface MarketplaceTemplate {
  id: string;
  code?: string;
  name?: string;
  description: string;
  channel: "EMAIL" | "SMS" | "PUSH" | "IN_APP" | "email" | "sms" | "push" | "in-app";
  category?: "MARKETING" | "TRANSACTIONAL" | "AUTHENTICATION" | "ALERTS" | "authentication" | "transactional" | "marketing" | "alerts";
  creator?: MarketplaceCreator | string;
  price?: number;
  currency?: string;
  rating: number;
  ratingCount: number;
  installs: number;
  subject?: string;
  language?: string;
  version?: number;
  active?: boolean;
  visibility?: "marketplace" | "private";
  isPublic?: boolean;
  thumbnail?: string | null;
  previewUrl?: string;
  previewImage?: string | null;
  screenshots?: string[];
  variables?: MarketplaceVariable[] | string[];
  tags?: string[];
  content?: string | { email?: { subject?: string; html?: string } };
  design_json?: Record<string, any>;
  designJson?: Record<string, any>;
  editor_type?: "visual" | "code";
  editorType?: string;
  estimatedDeliveryTime?: string;
  compatibility?: Record<string, boolean>;
  createdAt?: string;
  updatedAt?: string;
}

export interface MarketplaceCategory {
  id: string;
  name: string;
  description: string;
  count: number;
  icon: string;
}

export interface ListTemplatesParams {
  search?: string;
  channel?: string;
  category?: string;
  price?: "free" | "paid" | "all";
  sortBy?: "rating" | "installs" | "price" | "latest" | "trending";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface ListTemplatesResponse {
  templates: MarketplaceTemplate[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  filters: {
    channels: string[];
    categories: string[];
    priceRanges: string[];
  };
}

export interface TemplateDetailResponse extends MarketplaceTemplate {
  reviews?: Array<{
    userId: string;
    userName: string;
    rating: number;
    review: string;
    createdAt: string;
    helpful: number;
  }>;
  relatedTemplates?: string[];
  changelog?: Array<{
    version: string;
    date: string;
    changes: string;
  }>;
}

export interface InstallTemplatePayload {
  appId: string;
  templateName?: string;
  description?: string;
}

export interface RatingPayload {
  rating: number; // 1-5
  review?: string;
  helpful?: boolean;
}

export interface RatingResponse {
  id: string;
  templateId: string;
  userId: string;
  rating: number;
  review?: string;
  createdAt: string;
}

// ──────────────────────────────────────────
// LIST MARKETPLACE TEMPLATES
// ──────────────────────────────────────────

// Normalize channel and category to lowercase for component compatibility
const normalizeTemplate = (template: any): MarketplaceTemplate => ({
  ...template,
  channel: (template.channel || "").toLowerCase() as any,
  category: (template.category || "").toLowerCase() as any,
  price: template.price ?? 0,
  rating: template.rating ?? 0,
  ratingCount: template.ratingCount ?? 0,
  installs: template.installs ?? 0,
  tags: Array.isArray(template.tags) ? template.tags : [],
  // Explicitly handle previewImage: use it if available and not null, otherwise undefined
  previewImage: template.previewImage && typeof template.previewImage === 'string' ? template.previewImage : undefined,
});

export const listMarketplaceTemplatesService = async (params?: ListTemplatesParams) => {
  const queryParams = new URLSearchParams();

  if (params?.search) queryParams.append("search", params.search);
  if (params?.channel) queryParams.append("channel", params.channel);
  if (params?.category) queryParams.append("category", params.category);
  if (params?.price) queryParams.append("price", params.price);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const query = queryParams.toString() ? `?${queryParams.toString()}` : "";

  const { data } = await getApiClient().get<any>(
    `/api/marketplace/templates${query}`
  );

  return {
    templates: (data.data?.templates || data.data || []).map(normalizeTemplate),
    total: data.data?.total || data.meta?.total || 0,
    pagination: data.data?.pagination,
    filters: data.data?.filters,
  } as any;
};

// ──────────────────────────────────────────
// GET MARKETPLACE TEMPLATE DETAILS
// ──────────────────────────────────────────

export const getMarketplaceTemplateService = async (templateId: string) => {
  const { data } = await getApiClient().get<any>(
    `/api/marketplace/templates/${templateId}`
  );
  return data.data as TemplateDetailResponse;
};

// ──────────────────────────────────────────
// INSTALL MARKETPLACE TEMPLATE
// ──────────────────────────────────────────

export const installMarketplaceTemplateService = async (
  templateId: string,
  payload: InstallTemplatePayload
) => {
  const { data } = await getApiClient().post<any>(
    `/api/marketplace/templates/${templateId}/install`,
    payload
  );
  return data.data;
};

// ──────────────────────────────────────────
// RATE MARKETPLACE TEMPLATE
// ──────────────────────────────────────────

export const rateMarketplaceTemplateService = async (
  templateId: string,
  payload: RatingPayload
) => {
  const { data } = await getApiClient().post<any>(
    `/api/marketplace/templates/${templateId}/rate`,
    payload
  );
  return data.data as RatingResponse;
};

// ──────────────────────────────────────────
// GET USER'S RATING FOR TEMPLATE
// ──────────────────────────────────────────

export const getTemplateRatingService = async (templateId: string) => {
  const { data } = await getApiClient().get<any>(
    `/api/marketplace/templates/${templateId}/my-rating`
  );
  return data.data as RatingResponse;
};

// ──────────────────────────────────────────
// GET MARKETPLACE CATEGORIES
// ──────────────────────────────────────────

export const getMarketplaceCategoriesService = async () => {
  const { data } = await getApiClient().get<any>(
    `/api/marketplace/categories`
  );
  return data.data as { categories: MarketplaceCategory[] };
};
