import { Template } from "@/types/templates";

export const defaultTemplates: Template[] = [
  // Authentication
  {
    id: "welcome-email",
    slug: "welcome-email",
    name: "Welcome Email",
    description: "A friendly welcome email sent to new users",
    channel: "email",
    category: "authentication",
    author: "Notify",
    isFree: true,
    variables: [
      { name: "user_name", type: "string", example: "John Doe", required: true },
      { name: "company_name", type: "string", example: "Acme Corp", required: true },
      { name: "cta_url", type: "url", example: "https://example.com/onboard", required: true },
    ],
    content: {
      email: {
        subject: "Welcome to {{company_name}}!",
        html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <h1 style="font-size: 28px; margin: 0 0 16px 0; font-weight: bold;">Welcome, {{user_name}}!</h1>
  <p style="margin: 0 0 12px 0; line-height: 1.6;">Thanks for signing up for <strong>{{company_name}}</strong>.</p>
  <p style="margin: 0 0 16px 0; line-height: 1.6;">Click the button below to get started:</p>
  <a href="{{cta_url}}" style="display: inline-block; background-color: #0ea5e9; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 12px; font-weight: 500;">Get Started</a>
  <p style="margin: 24px 0 0 0; padding-top: 24px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">If you have any questions, please don't hesitate to reach out!</p>
</div>`,
      },
    },
  },
  {
    id: "email-verification",
    slug: "email-verification",
    name: "Email Verification",
    description: "Email verification code template",
    channel: "email",
    category: "authentication",
    author: "Notify",
    isFree: true,
    variables: [
      { name: "user_name", type: "string", example: "John", required: true },
      { name: "verification_code", type: "string", example: "123456", required: true },
      { name: "verification_link", type: "url", example: "https://example.com/verify", required: true },
    ],
    content: {
      email: {
        subject: "Verify your email address",
        html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <h1 style="font-size: 24px; margin: 0 0 16px 0;">Verify Your Email</h1>
  <p style="margin: 0 0 12px 0; line-height: 1.6;">Hi {{user_name}},</p>
  <p style="margin: 0 0 16px 0; line-height: 1.6;">Please use the following code to verify your email:</p>
  <div style="background: #f3f4f6; padding: 16px; border-radius: 6px; margin: 20px 0; text-align: center;">
    <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px;">{{verification_code}}</span>
  </div>
  <p style="margin: 0 0 12px 0; line-height: 1.6;">Or click the link below:</p>
  <a href="{{verification_link}}" style="display: inline-block; background-color: #0ea5e9; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">Verify Email</a>
</div>`,
      },
    },
  },
  {
    id: "password-reset",
    slug: "password-reset",
    name: "Password Reset",
    description: "Password reset request email",
    channel: "email",
    category: "authentication",
    author: "Notify",
    isFree: true,
    variables: [
      { name: "user_name", type: "string", example: "John", required: true },
      { name: "reset_link", type: "url", example: "https://example.com/reset", required: true },
      { name: "expiry_hours", type: "number", example: "24", required: true },
    ],
    content: {
      email: {
        subject: "Reset your password",
        html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <h1 style="font-size: 24px; margin: 0 0 16px 0;">Password Reset Request</h1>
  <p style="margin: 0 0 12px 0; line-height: 1.6;">Hi {{user_name}},</p>
  <p style="margin: 0 0 16px 0; line-height: 1.6;">We received a request to reset your password. Click the link below to create a new password:</p>
  <a href="{{reset_link}}" style="display: inline-block; background-color: #0ea5e9; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0; font-weight: 500;">Reset Password</a>
  <p style="margin: 0 0 12px 0; line-height: 1.6;">This link expires in {{expiry_hours}} hours.</p>
  <p style="margin: 12px 0 0 0; font-size: 12px; color: #6b7280;">If you didn't request this, please ignore this email.</p>
</div>`,
      },
    },
  },
  {
    id: "otp-code",
    slug: "otp-code",
    name: "OTP Code",
    description: "One-time password delivery via SMS",
    channel: "sms",
    category: "authentication",
    author: "Notify",
    isFree: true,
    variables: [
      { name: "otp_code", type: "string", example: "123456", required: true },
      { name: "company_name", type: "string", example: "Acme Corp", required: true },
    ],
    content: {
      sms: {
        body: "Your {{company_name}} verification code is: {{otp_code}}. Don't share this with anyone.",
      },
    },
  },

  // Transactional
  {
    id: "order-confirmation",
    slug: "order-confirmation",
    name: "Order Confirmation",
    description: "Order confirmation email for e-commerce",
    channel: "email",
    category: "transactional",
    author: "Notify",
    isFree: true,
    variables: [
      { name: "customer_name", type: "string", example: "Jane Smith", required: true },
      { name: "order_id", type: "string", example: "ORD-12345", required: true },
      { name: "order_total", type: "string", example: "$99.99", required: true },
      { name: "tracking_url", type: "url", example: "https://tracking.example.com", required: false },
    ],
    content: {
      email: {
        subject: "Order Confirmation - {{order_id}}",
        html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <h1 style="font-size: 24px; margin: 0 0 16px 0;">Order Confirmed!</h1>
  <p style="margin: 0 0 12px 0; line-height: 1.6;">Hi {{customer_name}},</p>
  <p style="margin: 0 0 16px 0; line-height: 1.6;">Thank you for your order! Here are your details:</p>
  <div style="background: #f3f4f6; padding: 16px; border-radius: 6px; margin: 20px 0;">
    <p style="margin: 0 0 8px 0;"><strong>Order ID:</strong> {{order_id}}</p>
    <p style="margin: 0 0 8px 0;"><strong>Total:</strong> {{order_total}}</p>
  </div>
  <p style="margin: 12px 0 0 0; font-size: 12px; color: #6b7280;">You'll receive a tracking number shortly.</p>
</div>`,
      },
    },
  },
  {
    id: "payment-receipt",
    slug: "payment-receipt",
    name: "Payment Receipt",
    description: "Payment confirmation receipt",
    channel: "email",
    category: "transactional",
    author: "Notify",
    isFree: true,
    variables: [
      { name: "customer_name", type: "string", example: "John Doe", required: true },
      { name: "amount", type: "string", example: "$49.99", required: true },
      { name: "transaction_id", type: "string", example: "TXN-98765", required: true },
      { name: "receipt_date", type: "string", example: "March 8, 2026", required: true },
    ],
    content: {
      email: {
        subject: "Payment Receipt - {{transaction_id}}",
        html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <h1 style="font-size: 24px; margin: 0 0 16px 0;">Payment Received</h1>
  <p style="margin: 0 0 12px 0; line-height: 1.6;">Hi {{customer_name}},</p>
  <p style="margin: 0 0 16px 0; line-height: 1.6;">We've received your payment. Here's your receipt:</p>
  <div style="background: #f3f4f6; padding: 16px; border-radius: 6px; margin: 20px 0;">
    <p style="margin: 0 0 8px 0;"><strong>Amount:</strong> {{amount}}</p>
    <p style="margin: 0 0 8px 0;"><strong>Transaction ID:</strong> {{transaction_id}}</p>
    <p style="margin: 0;"><strong>Date:</strong> {{receipt_date}}</p>
  </div>
</div>`,
      },
    },
  },

  // Marketing
  {
    id: "newsletter",
    slug: "newsletter",
    name: "Newsletter",
    description: "Monthly newsletter template",
    channel: "email",
    category: "marketing",
    author: "Notify",
    isFree: true,
    variables: [
      { name: "subscriber_name", type: "string", example: "John", required: true },
      { name: "month", type: "string", example: "March", required: true },
      { name: "cta_url", type: "url", example: "https://example.com/latest", required: true },
    ],
    content: {
      email: {
        subject: "{{month}} Newsletter - What's New",
        html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <h1 style="font-size: 24px; margin: 0 0 16px 0;">{{month}} Newsletter</h1>
  <p style="margin: 0 0 12px 0; line-height: 1.6;">Hi {{subscriber_name}},</p>
  <p style="margin: 0 0 16px 0; line-height: 1.6;">Check out what's new this month:</p>
  <a href="{{cta_url}}" style="display: inline-block; background-color: #0ea5e9; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0; font-weight: 500;">Read Latest Updates</a>
</div>`,
      },
    },
  },

  // Alerts
  {
    id: "security-alert",
    slug: "security-alert",
    name: "Security Alert",
    description: "Security alert notification",
    channel: "email",
    category: "alerts",
    author: "Notify",
    isFree: true,
    variables: [
      { name: "user_name", type: "string", example: "John", required: true },
      { name: "alert_message", type: "string", example: "New login from unknown location", required: true },
      { name: "action_url", type: "url", example: "https://example.com/security", required: true },
    ],
    content: {
      email: {
        subject: "⚠️ Security Alert",
        html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <h1 style="font-size: 24px; margin: 0 0 16px 0; color: #dc2626;">Security Alert</h1>
  <p style="margin: 0 0 12px 0; line-height: 1.6;">Hi {{user_name}},</p>
  <p style="margin: 0 0 16px 0; line-height: 1.6;"><strong>{{alert_message}}</strong></p>
  <p style="margin: 0 0 16px 0; line-height: 1.6;">If this wasn't you, please secure your account immediately:</p>
  <a href="{{action_url}}" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">Review Activity</a>
</div>`,
      },
    },
  },
];

/**
 * Get template by slug
 */
export function getTemplateBySlug(slug: string): Template | undefined {
  return defaultTemplates.find((t) => t.slug === slug);
}

/**
 * Get templates by channel
 */
export function getTemplatesByChannel(channel: string): Template[] {
  if (channel === "all") return defaultTemplates;
  return defaultTemplates.filter((t) => t.channel === channel);
}

/**
 * Search templates by name or description
 */
export function searchTemplates(query: string): Template[] {
  const lowerQuery = query.toLowerCase();
  return defaultTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}
