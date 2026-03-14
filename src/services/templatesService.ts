/**
 * Templates Service
 * Uses the existing apiClient from services/apiClient.ts
 * Integrates with backend API endpoints
 */

import getApiClient from './apiClient';
import { Template } from '@/types/templates';

// Backend API Response Types
interface ApiVariable {
  name: string;
  required: boolean;
}

interface ApiTemplate {
  id: string;
  slug: string;
  name: string;
  channel: string;
  category: string;
  author: string;
  isFree: boolean;
  variables: ApiVariable[];
  description: string;
  subject: string | null;
  content: {
    email?: {
      subject?: string;
      html?: string;
      body?: string;
      text?: string;
    };
    sms?: {
      body: string;
    };
    push?: {
      title: string;
      body: string;
    };
    "in-app"?: {
      title: string;
      body: string;
    };
  };
  language: string;
  version: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TemplatesResponse {
  success: boolean;
  resp_msg: string;
  resp_code: number;
  data: ApiTemplate[];
  meta?: {
    limit: number;
    offset: number;
    total: number;
  };
}

interface SingleTemplateResponse {
  success: boolean;
  resp_msg: string;
  resp_code: number;
  data: ApiTemplate;
}

/**
 * Transform API template to frontend template type
 */
function transformApiTemplate(apiTemplate: ApiTemplate): Template {
  const channelMap: Record<string, any> = {
    EMAIL: 'email',
    SMS: 'sms',
    PUSH: 'push',
    'IN-APP': 'in-app',
  };

  const categoryMap: Record<string, any> = {
    AUTH: 'authentication',
    AUTHENTICATION: 'authentication',
    TRANSACTIONAL: 'transactional',
    MARKETING: 'marketing',
    ALERTS: 'alerts',
    NOTIFICATION: 'alerts',
  };

  const channel = (channelMap[apiTemplate.channel] || apiTemplate.channel.toLowerCase()) as any;
  const category = (categoryMap[apiTemplate.category] || apiTemplate.category.toLowerCase()) as any;

  return {
    id: apiTemplate.id,
    slug: apiTemplate.slug,
    name: apiTemplate.name,
    description: apiTemplate.description,
    channel,
    category,
    author: apiTemplate.author,
    isFree: apiTemplate.isFree,
    subject: apiTemplate.subject,
    language: apiTemplate.language,
    version: apiTemplate.version,
    active: apiTemplate.active,
    createdAt: apiTemplate.createdAt,
    updatedAt: apiTemplate.updatedAt,
    variables: apiTemplate.variables.map((v) => ({
      name: v.name,
      required: v.required,
    })),
    content: apiTemplate.content,
  };
}

/**
 * Fetch all templates with pagination and optional filters
 * GET /api/templates?limit=20&offset=0&channel=EMAIL&search=welcome
 */
export async function fetchTemplates(options: {
  limit?: number;
  offset?: number;
  channel?: string;
  search?: string;
} = {}): Promise<{ templates: Template[]; total: number }> {
  const { limit = 20, offset = 0, channel, search } = options;

  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });

  if (channel && channel !== 'all') {
    params.append('channel', channel.toUpperCase());
  }

  if (search) {
    params.append('search', search);
  }

  try {
    const client = getApiClient();
    const response = await client.get<TemplatesResponse>(`/api/templates?${params.toString()}`);

    return {
      templates: response.data.data.map(transformApiTemplate),
      total: response.data.meta?.total || 0,
    };
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    throw error;
  }
}

/**
 * Search templates by query
 * GET /api/templates/search?channel=EMAIL&search=welcome
 */
export async function searchTemplates(options: {
  search: string;
  channel?: string;
  limit?: number;
  offset?: number;
} = { search: '' }): Promise<{ templates: Template[]; total: number }> {
  const { search, channel, limit = 20, offset = 0 } = options;

  const params = new URLSearchParams({
    search,
    limit: limit.toString(),
    offset: offset.toString(),
  });

  if (channel && channel !== 'all') {
    params.append('channel', channel.toUpperCase());
  }

  try {
    const client = getApiClient();
    const response = await client.get<TemplatesResponse>(`/api/templates/search?${params.toString()}`);

    return {
      templates: response.data.data.map(transformApiTemplate),
      total: response.data.meta?.total || 0,
    };
  } catch (error) {
    console.error('Failed to search templates:', error);
    throw error;
  }
}

/**
 * Fetch single template by slug
 * GET /api/templates/{slug}
 */
export async function fetchTemplate(slug: string): Promise<Template> {
  try {
    const client = getApiClient();
    const response = await client.get<SingleTemplateResponse>(`/api/templates/${slug}`);

    if (!response.data.success) {
      throw new Error(response.data.resp_msg || 'Failed to fetch template');
    }

    return transformApiTemplate(response.data.data);
  } catch (error) {
    console.error('Failed to fetch template:', error);
    throw error;
  }
}

/**
 * Fetch templates by channel
 * GET /api/templates?channel=EMAIL
 */
export async function fetchTemplatesByChannel(options: {
  channel: string;
  limit?: number;
  offset?: number;
} = { channel: 'EMAIL' }): Promise<{ templates: Template[]; total: number }> {
  const { channel, limit = 20, offset = 0 } = options;

  const params = new URLSearchParams({
    channel: channel.toUpperCase(),
    limit: limit.toString(),
    offset: offset.toString(),
  });

  try {
    const client = getApiClient();
    const response = await client.get<TemplatesResponse>(`/api/templates?${params.toString()}`);

    return {
      templates: response.data.data.map(transformApiTemplate),
      total: response.data.meta?.total || 0,
    };
  } catch (error) {
    console.error('Failed to fetch templates by channel:', error);
    throw error;
  }
}

/**
 * Fetch user projects (protected)
 * GET /api/projects
 */
export async function fetchUserProfile() {
  try {
    const client = getApiClient();
    const response = await client.get<any>('/api/auth/profile');
    // return response.data.data;
    return []
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    throw error;
  }
}

/**
 * Create a new project (protected)
 * POST /api/projects
 */
export async function createProject(options: {
  name: string;
  description?: string;
}): Promise<any> {
  try {
    const client = getApiClient();
    const response = await client.post<any>('/api/projects', {
      name: options.name,
      description: options.description,
    });

    if (!response.data.success) {
      throw new Error(response.data.resp_msg || 'Failed to create project');
    }

    return response.data.data;
  } catch (error) {
    console.error('Failed to create project:', error);
    throw error;
  }
}

/**
 * Get a single project by ID (protected)
 * GET /api/projects/:id
 */
export async function getProject(id: string): Promise<any> {
  try {
    const client = getApiClient();
    const response = await client.get<any>(`/api/projects/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.resp_msg || 'Failed to fetch project');
    }

    return response.data.data;
  } catch (error) {
    console.error('Failed to get project:', error);
    throw error;
  }
}

/**
 * Update a project (protected)
 * PUT /api/projects/:id
 */
export async function updateProject(
  id: string,
  options: {
    name?: string;
    description?: string;
  }
): Promise<any> {
  try {
    const client = getApiClient();
    const response = await client.put<any>(`/api/projects/${id}`, {
      name: options.name,
      description: options.description,
    });

    if (!response.data.success) {
      throw new Error(response.data.resp_msg || 'Failed to update project');
    }

    return response.data.data;
  } catch (error) {
    console.error('Failed to update project:', error);
    throw error;
  }
}

/**
 * Delete a project (protected)
 * DELETE /api/projects/:id
 */
export async function deleteProject(id: string): Promise<void> {
  try {
    const client = getApiClient();
    const response = await client.delete<any>(`/api/projects/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.resp_msg || 'Failed to delete project');
    }
  } catch (error) {
    console.error('Failed to delete project:', error);
    throw error;
  }
}

/**
 * Install template to project (protected)
 * POST /api/templates/create
 * Creates a new template instance in the user's project based on gallery template
 */
export async function installTemplate(options: {
  slug: string;
  projectId: string;
  name: string;
  channel: string;
  subject?: string | null;
  content: any;
  language?: string;
  description?: string;
}) {
  const { slug, projectId, name, channel, subject, content, language = 'en', description } = options;

  try {
    const client = getApiClient();

    // Generate unique code based on template slug and timestamp
    const timestamp = Date.now().toString().slice(-6);
    const code = `${slug.toUpperCase().replace(/-/g, '_')}_${timestamp}`;

    // Get channel content based on the channel type
    let templateContent = '';
    if (channel.toUpperCase() === 'EMAIL') {
      templateContent = content.email?.html || content.email?.body || '';
    } else if (channel.toUpperCase() === 'SMS') {
      templateContent = content.sms?.body || '';
    } else if (channel.toUpperCase() === 'PUSH') {
      templateContent = content.push?.body || '';
    } else if (channel.toUpperCase() === 'IN_APP') {
      templateContent = content['in-app']?.body || '';
    }

    // Build request body matching backend schema
    const requestBody: any = {
      code,
      channel: channel.toUpperCase(),
      content: templateContent,
      language,
      project_id: projectId,
    };

    // Add optional fields if they exist
    if (subject) {
      requestBody.subject = subject;
    }
    if (description) {
      requestBody.description = description || name;
    }

    const response = await client.post<any>('/api/templates/create', requestBody);

    if (!response.data.success) {
      throw new Error(response.data.resp_msg || 'Failed to create template');
    }

    return response.data.data;
  } catch (error) {
    console.error('Failed to install template:', error);
    throw error;
  }
}

/**
 * Get template installation status (protected)
 * GET /api/templates/{slug}/status
 */
export async function getTemplateStatus(slug: string) {
  try {
    const client = getApiClient();
    const response = await client.get<any>(`/api/templates/${slug}/status`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to get template status:', error);
    throw error;
  }
}

/**
 * Get template analytics (protected)
 * GET /api/templates/{slug}/analytics
 */
export async function getTemplateAnalytics(slug: string) {
  try {
    const client = getApiClient();
    const response = await client.get<any>(`/api/templates/${slug}/analytics`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to get template analytics:', error);
    throw error;
  }
}
/**
 * Get template by ID
 * GET /api/templates/{id}
 */
export async function getTemplateById(id: string) {
  try {
    const client = getApiClient();
    const response = await client.get<any>(`/api/templates/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to get template by ID:', error);
    throw error;
  }
}

/**
 * Create a new template
 * POST /api/templates
 */
export interface CreateTemplatePayload {
  code: string;
  channel: "email" | "sms" | "push" | "in-app" | "EMAIL" | "SMS" | "PUSH" | "IN_APP" | "WHATSAPP";
  category?: string;
  subject?: string;
  content: string;
  language?: string;
  description?: string;
  requiredVariables?: Record<string, string>;
  visibility?: "private" | "public";
  is_public?: boolean;
  accountId?: string;
}

export async function createTemplateService(payload: CreateTemplatePayload) {
  try {
    const client = getApiClient();
    const headers: Record<string, string> = {};

    if (payload.accountId) {
      headers["x-account-id"] = payload.accountId;
    } else {
      console.warn("⚠ No accountId provided - x-account-id header will NOT be sent");
    }

    const requestBody = {
      code: payload.code,
      channel: payload.channel,
      category: payload.category,
      subject: payload.subject,
      content: payload.content,
      language: payload.language || "en",
      description: payload.description,
      requiredVariables: payload.requiredVariables,
      visibility: payload.visibility || "private",
      is_public: payload.is_public ?? false,
    };

    const response = await client.post<any>(
      "/api/templates",
      requestBody,
      { headers }
    );

    return response.data.data || response.data;
  } catch (error) {
    console.error('Failed to create template:', error);
    throw error;
  }
}

/**
 * Update template
 * PUT /api/templates/{id}
 */
export async function updateTemplateService(
  templateId: string,
  payload: Partial<CreateTemplatePayload>
) {
  try {
    const client = getApiClient();
    const headers: Record<string, string> = {};

    if (payload.accountId) {
      headers["x-account-id"] = payload.accountId;
    } else {
      console.warn("⚠ No accountId provided - x-account-id header will NOT be sent");
    }

    const requestBody = {
      slug: payload.code || templateId,
      code: payload.code,
      channel: payload.channel,
      category: payload.category,
      subject: payload.subject,
      content: payload.content,
      language: payload.language || "en",
      description: payload.description,
      requiredVariables: payload.requiredVariables,
      visibility: payload.visibility || "private",
      is_public: payload.is_public ?? false,
    };

    const response = await client.put<any>(
      `/api/templates/${templateId}`,
      requestBody,
      { headers }
    );

    return response.data.data || response.data;
  } catch (error) {
    console.error('Failed to update template:', error);
    throw error;
  }
}

/**
 * Delete template
 * DELETE /api/templates/{id}
 */
export async function deleteTemplateService(templateId: string) {
  try {
    const client = getApiClient();
    const response = await client.delete<any>(`/api/templates/${templateId}`);

    return response.data.data || response.data;
  } catch (error) {
    console.error('Failed to delete template:', error);
    throw error;
  }
}

/**
 * Duplicate template
 * POST /api/templates/{id}/duplicate
 */
export async function duplicateTemplateService(
  templateId: string,
  newName?: string
) {
  try {
    const client = getApiClient();
    const response = await client.post<any>(
      `/api/templates/${templateId}/duplicate`,
      { name: newName }
    );

    return response.data.data || response.data;
  } catch (error) {
    console.error('Failed to duplicate template:', error);
    throw error;
  }
}

/**
 * Get app templates
 * GET /api/apps/{appId}/templates
 */
export async function getAppTemplatesService(appId: string) {
  try {
    const client = getApiClient();
    const response = await client.get<any>(`/api/apps/${appId}/templates`);

    return response.data.data || response.data;
  } catch (error) {
    console.error('Failed to get app templates:', error);
    throw error;
  }
}

/**
 * Get app template by ID
 * GET /api/apps/{appId}/templates/{id}
 */
export async function getAppTemplateService(appId: string, templateId: string) {
  try {
    const client = getApiClient();
    const response = await client.get<any>(
      `/api/apps/${appId}/templates/${templateId}`
    );

    return response.data.data || response.data;
  } catch (error) {
    console.error('Failed to get app template:', error);
    throw error;
  }
}

/**
 * Update app template
 * PUT /api/apps/{appId}/templates/{id}
 */
export async function updateAppTemplateService(
  appId: string,
  templateId: string,
  payload: Partial<CreateTemplatePayload>
) {
  try {
    const client = getApiClient();
    const response = await client.put<any>(
      `/api/apps/${appId}/templates/${templateId}`,
      payload
    );

    return response.data.data || response.data;
  } catch (error) {
    console.error('Failed to update app template:', error);
    throw error;
  }
}

/**
 * Delete app template
 * DELETE /api/apps/{appId}/templates/{id}
 */
export async function deleteAppTemplateService(appId: string, templateId: string) {
  try {
    const client = getApiClient();
    const response = await client.delete<any>(
      `/api/apps/${appId}/templates/${templateId}`
    );

    return response.data.data || response.data;
  } catch (error) {
    console.error('Failed to delete app template:', error);
    throw error;
  }
}
