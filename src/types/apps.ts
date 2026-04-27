/**
 * Type definitions for Apps, Templates, Notifications, and API Keys
 * Separated from service implementation files for better organization
 */

// ──────────────────────────────────────────
// APP TYPES
// ──────────────────────────────────────────

export interface CreateAppPayload {
  name: string;
  orgId: string;
  accountId: string;
  environment?: "development" | "staging" | "production";
  description?: string;
}

// ──────────────────────────────────────────
// APP TEMPLATE TYPES
// ──────────────────────────────────────────

export interface CreateAppTemplatePayload {
  channel: "EMAIL" | "SMS" | "PUSH" | "IN_APP" | "WHATSAPP";
  code: string;
  content: string;
  subject?: string;
  description?: string;
  is_public?: boolean;
  language?: string;
  visibility?: "private" | "public";
  design_json?: any;
  editor_type?: string;
}

export interface AppTemplateResponse {
  installationId: string;
  appId: string;
  status: "active" | "inactive" | "archived";
  customizations: Record<string, any>;
  installationDate: string;
  updatedAt?: string;
  template: {
    id: string;
    code: string;
    channel: string;
    category: string;
    subject?: string;
    content: string;
    language: string;
    version: number;
    active: boolean;
    requiredVariables: string[];
    description?: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface AppTemplatesResponse {
  appId: string;
  templates: AppTemplateResponse[];
  total: number;
}

// ──────────────────────────────────────────
// APP OVERVIEW TYPES
// ──────────────────────────────────────────

export interface NotificationDataPoint {
  date: string;
  email: number;
  sms: number;
  push: number;
  inApp: number;
}

export interface AppOverview {
  appId: string;
  name: string;
  environment: string;
  stats: {
    totalNotificationsSent: number;
    totalTemplates: number;
    totalApiKeys: number;
    activeApiKeys: number;
  };
  chartData: NotificationDataPoint[];
  recentActivity: {
    totalToday: number;
    totalThisWeek: number;
    totalThisMonth: number;
  };
}

// ──────────────────────────────────────────
// ORGANIZATION APPS TYPES
// ──────────────────────────────────────────

export interface OrganizationAppDetails {
  id: string;
  name: string;
  environment: "production" | "staging" | "development";
  status: string;
  createdAt: string;
  templateCount: number;
  templatesSent: number;
}

export interface OrganizationAppsDetailsResponse {
  organization_id: string;
  apps: OrganizationAppDetails[];
  total: number;
}

// ──────────────────────────────────────────
// NOTIFICATION TYPES
// ──────────────────────────────────────────

export interface NotificationProviderLog {
  id: string;
  provider: string;
  status: "SENT" | "FAILED" | "PENDING" | "BOUNCED";
  channel?: string;
  response?: Record<string, any> | string | null;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  appId: string;
  accountId?: string;
  recipient: string;
  channel: "EMAIL" | "SMS" | "PUSH" | "IN_APP" | "WHATSAPP";
  status: "SENT" | "FAILED" | "PENDING" | "BOUNCED" | "QUEUED";
  deliveryState?:
    | "SENT"
    | "DELIVERED"
    | "FAILED"
    | "PENDING"
    | "BOUNCED"
    | "QUEUED";
  source?: string;
  provider?: string;
  templateCode?: string;
  templateId?: string;
  retryCount?: number;
  createdAt?: string;
  sentAt?: string;
  logs?: NotificationProviderLog[];
}

export interface AppNotificationsSummary {
  totalCount: number;
  deliveredCount: number;
  failedCount: number;
  pendingCount: number;
  bouncedCount: number;
  deliveryRate: number;
  failureRate: number;
}

export interface AppNotificationsResponse {
  appId: string;
  notifications: AppNotification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary?: AppNotificationsSummary;
}

// ──────────────────────────────────────────
// API KEY TYPES
// ──────────────────────────────────────────

export interface CreateApiKeyPayload {
  name: string;
  type?: "test" | "production";
}

export interface ApiKey {
  id: string;
  plainKey?: string; // Only returned on creation
  name: string;
  type: "test" | "production";
  createdAt: string;
  maskedKey?: string; // Partially masked key for display
}

export interface ApiKeysResponse {
  appId: string;
  apiKeys: ApiKey[];
  total: number;
}

export interface CreateApiKeyResponse {
  id: string;
  plainKey: string;
  name: string;
  type: "test" | "production";
  createdAt: string;
  message: string;
}
