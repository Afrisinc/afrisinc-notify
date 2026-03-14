/**
 * Mock data for the Notify multi-tenant dashboard prototype
 */

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  plan: "free" | "pro" | "enterprise";
  createdAt: string;
}

export interface OrgMember {
  id: string;
  orgId: string;
  userId: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  avatar?: string;
  joinedAt: string;
}

export interface App {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  environment: "development" | "staging" | "production";
  createdAt: string;
  templateCount: number;
  apiKeyCount: number;
  notificationsSent: number;
}

export interface AppTemplate {
  id: string;
  appId: string;
  name: string;
  channel: "email" | "sms" | "push" | "in-app";
  subject?: string;
  content: string;
  variables: string[];
  version: number;
  status: "active" | "draft" | "archived";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceTemplate {
  id: string;
  name: string;
  description: string;
  channel: "email" | "sms" | "push" | "in-app";
  category: "authentication" | "transactional" | "marketing" | "alerts";
  creator: string;
  price: number; // 0 = free
  previewUrl?: string;
  installs: number;
  rating: number;
  content: string;
  variables: string[];
}

// ── Organizations ──
export const organizations: Organization[] = [
  { id: "org-1", name: "Afrisinc", slug: "afrisinc", plan: "enterprise", createdAt: "2024-06-01" },
  { id: "org-2", name: "My Startup", slug: "my-startup", plan: "pro", createdAt: "2025-01-15" },
  { id: "org-3", name: "Personal", slug: "personal", plan: "free", createdAt: "2025-03-01" },
];

// ── Members ──
export const members: OrgMember[] = [
  { id: "m-1", orgId: "org-1", userId: "u-1", name: "John Doe", email: "john@afrisinc.com", role: "owner", joinedAt: "2024-06-01" },
  { id: "m-2", orgId: "org-1", userId: "u-2", name: "Sarah Chen", email: "sarah@afrisinc.com", role: "admin", joinedAt: "2024-07-10" },
  { id: "m-3", orgId: "org-1", userId: "u-3", name: "Mike Johnson", email: "mike@afrisinc.com", role: "member", joinedAt: "2024-09-20" },
  { id: "m-4", orgId: "org-1", userId: "u-4", name: "Lisa Park", email: "lisa@afrisinc.com", role: "member", joinedAt: "2025-01-05" },
  { id: "m-5", orgId: "org-2", userId: "u-1", name: "John Doe", email: "john@mystartup.io", role: "owner", joinedAt: "2025-01-15" },
  { id: "m-6", orgId: "org-2", userId: "u-5", name: "Alex Rivera", email: "alex@mystartup.io", role: "admin", joinedAt: "2025-02-01" },
  { id: "m-7", orgId: "org-3", userId: "u-1", name: "John Doe", email: "john@personal.dev", role: "owner", joinedAt: "2025-03-01" },
];

// ── Apps ──
export const apps: App[] = [
  { id: "app-1", orgId: "org-1", name: "Production App", environment: "production", description: "Main production notification service", createdAt: "2024-06-15", templateCount: 12, apiKeyCount: 3, notificationsSent: 45230 },
  { id: "app-2", orgId: "org-1", name: "Staging App", environment: "staging", description: "Testing environment", createdAt: "2024-07-01", templateCount: 8, apiKeyCount: 2, notificationsSent: 1340 },
  { id: "app-3", orgId: "org-1", name: "Dev App", environment: "development", description: "Development sandbox", createdAt: "2024-08-10", templateCount: 5, apiKeyCount: 1, notificationsSent: 230 },
  { id: "app-4", orgId: "org-2", name: "MVP App", environment: "production", description: "Startup MVP notifications", createdAt: "2025-02-01", templateCount: 3, apiKeyCount: 1, notificationsSent: 890 },
  { id: "app-5", orgId: "org-2", name: "Dev Environment", environment: "development", createdAt: "2025-02-10", templateCount: 2, apiKeyCount: 1, notificationsSent: 56 },
  { id: "app-6", orgId: "org-3", name: "Side Project", environment: "development", description: "Personal experiments", createdAt: "2025-03-05", templateCount: 1, apiKeyCount: 1, notificationsSent: 12 },
];

// ── App Templates ──
export const appTemplates: AppTemplate[] = [
  { id: "t-1", appId: "app-1", name: "Welcome Email", channel: "email", subject: "Welcome to {{appName}}!", content: "<h1>Welcome, {{name}}!</h1><p>Thanks for joining.</p>", variables: ["name", "appName"], version: 3, status: "active", createdBy: "John Doe", createdAt: "2024-06-20", updatedAt: "2025-01-10" },
  { id: "t-2", appId: "app-1", name: "Password Reset", channel: "email", subject: "Reset your password", content: "<p>Click <a href='{{resetUrl}}'>here</a> to reset.</p>", variables: ["resetUrl"], version: 2, status: "active", createdBy: "Sarah Chen", createdAt: "2024-07-15", updatedAt: "2024-12-01" },
  { id: "t-3", appId: "app-1", name: "Order Confirmation SMS", channel: "sms", content: "Hi {{name}}, your order #{{orderId}} is confirmed!", variables: ["name", "orderId"], version: 1, status: "active", createdBy: "John Doe", createdAt: "2024-08-01", updatedAt: "2024-08-01" },
  { id: "t-4", appId: "app-1", name: "New Login Alert", channel: "push", content: "New login detected from {{location}}", variables: ["location"], version: 1, status: "active", createdBy: "Mike Johnson", createdAt: "2024-09-15", updatedAt: "2024-09-15" },
  { id: "t-5", appId: "app-1", name: "Feature Announcement", channel: "in-app", content: "We just launched {{feature}}! Check it out.", variables: ["feature"], version: 2, status: "draft", createdBy: "Lisa Park", createdAt: "2025-01-05", updatedAt: "2025-02-20" },
  { id: "t-6", appId: "app-2", name: "Test Welcome Email", channel: "email", subject: "Test: Welcome", content: "<p>Test welcome email</p>", variables: ["name"], version: 1, status: "draft", createdBy: "Sarah Chen", createdAt: "2024-07-05", updatedAt: "2024-07-05" },
  { id: "t-7", appId: "app-4", name: "Signup OTP", channel: "sms", content: "Your OTP is {{code}}", variables: ["code"], version: 1, status: "active", createdBy: "John Doe", createdAt: "2025-02-05", updatedAt: "2025-02-05" },
  { id: "t-8", appId: "app-6", name: "Hello World", channel: "email", subject: "Hello!", content: "<p>Hello {{name}}</p>", variables: ["name"], version: 1, status: "draft", createdBy: "John Doe", createdAt: "2025-03-06", updatedAt: "2025-03-06" },
];

// ── Marketplace Templates ──
export const marketplaceTemplates: MarketplaceTemplate[] = [
  { id: "mp-1", name: "Professional Welcome Email", description: "A beautifully designed welcome email with brand customization options.", channel: "email", category: "authentication", creator: "Notify Team", price: 0, installs: 2340, rating: 4.8, content: "<h1>Welcome</h1>", variables: ["name", "company"] },
  { id: "mp-2", name: "2FA OTP SMS", description: "Secure two-factor authentication OTP template with expiry info.", channel: "sms", category: "authentication", creator: "Notify Team", price: 0, installs: 5120, rating: 4.9, content: "Your code: {{code}}", variables: ["code", "expiry"] },
  { id: "mp-3", name: "Order Shipped", description: "Notify customers when their order has been shipped with tracking.", channel: "email", category: "transactional", creator: "E-Commerce Pack", price: 4.99, installs: 890, rating: 4.6, content: "<p>Shipped!</p>", variables: ["name", "trackingUrl", "orderId"] },
  { id: "mp-4", name: "Payment Receipt", description: "Clean payment confirmation email with invoice details.", channel: "email", category: "transactional", creator: "FinTech Templates", price: 2.99, installs: 1560, rating: 4.7, content: "<p>Payment confirmed</p>", variables: ["name", "amount", "invoiceId"] },
  { id: "mp-5", name: "Flash Sale Push", description: "Eye-catching push notification for flash sales and promotions.", channel: "push", category: "marketing", creator: "Growth Kit", price: 1.99, installs: 670, rating: 4.3, content: "🔥 {{discount}}% off!", variables: ["discount", "productName"] },
  { id: "mp-6", name: "Weekly Digest", description: "Automated weekly summary email for user engagement.", channel: "email", category: "marketing", creator: "Growth Kit", price: 3.99, installs: 430, rating: 4.5, content: "<h2>Your weekly digest</h2>", variables: ["name", "highlights"] },
  { id: "mp-7", name: "Server Down Alert", description: "Critical alert for server downtime with incident details.", channel: "sms", category: "alerts", creator: "DevOps Pack", price: 0, installs: 3210, rating: 4.9, content: "⚠️ {{service}} is down", variables: ["service", "timestamp"] },
  { id: "mp-8", name: "In-App Feature Tour", description: "Guided feature introduction with step-by-step walkthrough.", channel: "in-app", category: "marketing", creator: "UX Templates", price: 5.99, installs: 290, rating: 4.4, content: "Discover {{feature}}", variables: ["feature", "step"] },
  { id: "mp-9", name: "Invoice Overdue", description: "Polite overdue payment reminder with payment link.", channel: "email", category: "transactional", creator: "FinTech Templates", price: 2.99, installs: 780, rating: 4.6, content: "<p>Payment overdue</p>", variables: ["name", "amount", "paymentUrl"] },
  { id: "mp-10", name: "Security Alert Push", description: "Immediate push notification for suspicious account activity.", channel: "push", category: "alerts", creator: "Notify Team", price: 0, installs: 4100, rating: 4.8, content: "Security alert: {{event}}", variables: ["event", "location"] },
];
