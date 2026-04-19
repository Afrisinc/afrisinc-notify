// Mock marketplace templates data
// This is for development/demo purposes

export interface MarketplaceTemplate {
  id: string;
  name: string;
  subject?: string;
  description: string;
  category: "authentication" | "transactional" | "marketing" | "alerts" | "ecommerce";
  channel: "email" | "sms" | "push" | "in-app";
  price: number; // 0 for free
  rating: number; // 0-5
  downloads: number;
  installs: number;
  image?: string; // Legacy: URL to preview image (fallback)
  previewUrl?: string; // Primary: Published template preview URL from assets service
  previewImage?: string | null; // API response field: preview image URL
  thumbnail?: string; // Secondary: Published template thumbnail URL from assets service
  tags: string[];
  creator?: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
  };
  preview?: {
    subject?: string;
    content?: string;
  };
  features?: string[];
  variables?: string[];
  updatedAt?: string;
  color?: string; // Gradient color for card
}

export const mockTemplates: MarketplaceTemplate[] = [
  {
    id: "1",
    name: "Welcome Email",
    description: "Get new users excited. Mobile-optimized welcome with CTA buttons that actually convert.",
    category: "authentication",
    channel: "email",
    price: 0,
    rating: 4.8,
    downloads: 12500,
    installs: 8300,
    image: "https://images.unsplash.com/photo-1557821552-17105176677c?w=500&h=300&fit=crop",
    tags: ["onboarding", "welcome", "user-friendly"],
    creator: {
      id: "creator-1",
      name: "AfriSinc Team",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AfriSinc",
      verified: true,
    },
    preview: {
      subject: "Welcome to {{companyName}}! 🎉",
      content: "Hi {{firstName}}, we're excited to have you on board.",
    },
    features: ["Responsive design", "Dark mode", "Mobile-optimized", "Customizable CTA"],
    variables: ["companyName", "firstName", "ctaUrl"],
    updatedAt: "2025-02-10",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "2",
    name: "Order Confirmation",
    description: "Turn confirmation into delight. Show order details, tracking link, and support info beautifully.",
    category: "ecommerce",
    channel: "email",
    price: 5,
    rating: 4.9,
    downloads: 18900,
    installs: 15200,
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&h=300&fit=crop",
    tags: ["ecommerce", "orders", "transactional"],
    creator: {
      id: "creator-2",
      name: "Commerce Experts",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=commerce",
      verified: true,
    },
    preview: {
      subject: "Your order #{{orderNumber}} is confirmed!",
      content: "Thank you for your purchase of {{productName}}",
    },
    features: ["Order tracking", "Product images", "Pricing breakdown", "Support links"],
    variables: ["orderNumber", "productName", "totalAmount", "trackingUrl"],
    updatedAt: "2025-02-08",
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "3",
    name: "Password Reset",
    description: "Keep accounts secure. Clean, scannable reset email with time-limited link and safety tips.",
    category: "authentication",
    channel: "email",
    price: 0,
    rating: 4.7,
    downloads: 21300,
    installs: 18900,
    image: "https://images.unsplash.com/photo-1526374965328-7f5ae4e8b69e?w=500&h=300&fit=crop",
    tags: ["security", "password", "authentication"],
    creator: {
      id: "creator-3",
      name: "Security First",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=security",
      verified: true,
    },
    preview: {
      subject: "Reset your password",
      content: "Click the button below to reset your password. This link expires in 24 hours.",
    },
    features: ["Link expiration", "Security notice", "Alternative reset", "No plain text"],
    variables: ["resetLink", "expiresIn"],
    updatedAt: "2025-01-28",
    color: "from-red-500 to-pink-500",
  },
  {
    id: "4",
    name: "Payment Failed Alert",
    description: "Save failed transactions. Clear error message with one-click retry and support link.",
    category: "alerts",
    channel: "email",
    price: 0,
    rating: 4.6,
    downloads: 9800,
    installs: 7200,
    image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=500&h=300&fit=crop",
    tags: ["payments", "alerts", "billing"],
    creator: {
      id: "creator-1",
      name: "AfriSinc Team",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AfriSinc",
      verified: true,
    },
    preview: {
      subject: "We couldn't process your payment",
      content: "Your {{planName}} subscription payment couldn't be processed.",
    },
    features: ["Retry button", "Billing portal link", "Contact support", "Clear action items"],
    variables: ["planName", "billingPortalUrl", "supportEmail"],
    updatedAt: "2025-02-05",
    color: "from-orange-500 to-red-500",
  },
  {
    id: "5",
    name: "Newsletter Digest",
    description: "Build your audience. Multi-section newsletter template with featured stories and social links.",
    category: "marketing",
    channel: "email",
    price: 3,
    rating: 4.8,
    downloads: 15600,
    installs: 12400,
    image: "https://images.unsplash.com/photo-1587614382346-4ec2e10529d0?w=500&h=300&fit=crop",
    tags: ["newsletter", "marketing", "content"],
    creator: {
      id: "creator-4",
      name: "Creative Studio",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=creative",
      verified: true,
    },
    preview: {
      subject: "This week in {{industry}} - {{issueNumber}}",
      content: "Your weekly digest of the most important stories.",
    },
    features: ["Multi-section layout", "Article grid", "Social links", "Subscription management"],
    variables: ["industry", "issueNumber", "articles"],
    updatedAt: "2025-02-09",
    color: "from-purple-500 to-indigo-500",
  },
  {
    id: "6",
    name: "Two-Factor Authentication",
    description: "Secure 2FA code delivery with clear instructions and security tips.",
    category: "authentication",
    channel: "sms",
    price: 0,
    rating: 4.9,
    downloads: 25800,
    installs: 22100,
    image: "https://images.unsplash.com/photo-1516534775068-bb57e39c8ac4?w=500&h=300&fit=crop",
    tags: ["2fa", "security", "verification"],
    creator: {
      id: "creator-3",
      name: "Security First",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=security",
      verified: true,
    },
    preview: {
      subject: "Your verification code",
      content: "Your {{companyName}} verification code is: {{code}}",
    },
    features: ["SMS optimized", "Code formatting", "Expiration notice", "Security message"],
    variables: ["companyName", "code", "expiresIn"],
    updatedAt: "2025-02-11",
    color: "from-violet-500 to-purple-500",
  },
  {
    id: "7",
    name: "Appointment Reminder",
    description: "Appointment reminder with date, time, location, and rescheduling options.",
    category: "transactional",
    channel: "sms",
    price: 2,
    rating: 4.7,
    downloads: 11200,
    installs: 8900,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
    tags: ["appointments", "reminders", "scheduling"],
    creator: {
      id: "creator-5",
      name: "Booking Masters",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=booking",
      verified: false,
    },
    preview: {
      subject: "Appointment Reminder",
      content: "Your appointment with {{doctorName}} is on {{date}} at {{time}}",
    },
    features: ["Time formatting", "Reschedule link", "Location info", "Mobile-friendly"],
    variables: ["doctorName", "date", "time", "locationUrl"],
    updatedAt: "2025-01-30",
    color: "from-cyan-500 to-blue-500",
  },
  {
    id: "8",
    name: "Promotional Campaign",
    description: "Boost sales. Eye-catching design with discount codes, timer, and product showcase.",
    category: "marketing",
    channel: "email",
    price: 4,
    rating: 4.5,
    downloads: 13400,
    installs: 10800,
    image: "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=500&h=300&fit=crop",
    tags: ["promotion", "discount", "sales"],
    creator: {
      id: "creator-4",
      name: "Creative Studio",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=creative",
      verified: true,
    },
    preview: {
      subject: "🎉 {{discountPercent}}% OFF - This weekend only!",
      content: "Don't miss out on our biggest sale of the year",
    },
    features: ["Bold design", "Discount code", "Timer element", "Product showcase"],
    variables: ["discountPercent", "discountCode", "endTime"],
    updatedAt: "2025-02-03",
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: "9",
    name: "Subscription Renewal",
    description: "Manage renewals gracefully. Show next date, benefits, and easy plan management options.",
    category: "transactional",
    channel: "email",
    price: 0,
    rating: 4.8,
    downloads: 16700,
    installs: 13500,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
    tags: ["subscriptions", "billing", "renewal"],
    creator: {
      id: "creator-1",
      name: "AfriSinc Team",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AfriSinc",
      verified: true,
    },
    preview: {
      subject: "Your {{planName}} subscription will renew on {{renewalDate}}",
      content: "Keep enjoying {{benefits}} with us",
    },
    features: ["Auto-renewal details", "Plan benefits", "Payment method", "Support links"],
    variables: ["planName", "renewalDate", "benefits", "amount"],
    updatedAt: "2025-02-07",
    color: "from-teal-500 to-green-500",
  },
  {
    id: "10",
    name: "Service Downtime Alert",
    description: "Critical system alert for service downtime with incident status and updates.",
    category: "alerts",
    channel: "email",
    price: 0,
    rating: 4.6,
    downloads: 8500,
    installs: 6200,
    image: "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=500&h=300&fit=crop",
    tags: ["alerts", "incidents", "status"],
    creator: {
      id: "creator-3",
      name: "Security First",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=security",
      verified: true,
    },
    preview: {
      subject: "⚠️ Service Incident Alert",
      content: "We're experiencing issues affecting {{serviceName}}",
    },
    features: ["Status updates", "Timeline", "Impact info", "Status page link"],
    variables: ["serviceName", "incidentId", "statusPageUrl"],
    updatedAt: "2025-02-04",
    color: "from-rose-500 to-red-500",
  },
  {
    id: "11",
    name: "SMS Marketing Campaign",
    description: "Concise SMS marketing message with short codes and click-through tracking.",
    category: "marketing",
    channel: "sms",
    price: 3,
    rating: 4.7,
    downloads: 9200,
    installs: 7100,
    image: "https://images.unsplash.com/photo-1611092583519-681366b3f78f?w=500&h=300&fit=crop",
    tags: ["sms", "marketing", "mobile"],
    creator: {
      id: "creator-4",
      name: "Creative Studio",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=creative",
      verified: true,
    },
    preview: {
      subject: "SMS Marketing",
      content: "{{offerText}} Reply STOP to opt out.",
    },
    features: ["160 char limit", "Short link", "STOP instruction", "TCPA compliant"],
    variables: ["offerText", "shortUrl"],
    updatedAt: "2025-02-06",
    color: "from-lime-500 to-green-500",
  },
  {
    id: "12",
    name: "Push Notification - Flash Sale",
    description: "Time-sensitive push notification for flash sales with deep link to products.",
    category: "marketing",
    channel: "push",
    price: 2,
    rating: 4.6,
    downloads: 10500,
    installs: 8300,
    image: "https://images.unsplash.com/photo-1516534775068-bb57e39c8ac4?w=500&h=300&fit=crop",
    tags: ["push", "sales", "mobile-app"],
    creator: {
      id: "creator-5",
      name: "Booking Masters",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=booking",
      verified: false,
    },
    preview: {
      subject: "Flash Sale Alert",
      content: "🔥 {{discountPercent}}% off {{productName}} - Ends in {{timeLeft}}",
    },
    features: ["Deep linking", "Timer", "Product preview", "Action buttons"],
    variables: ["discountPercent", "productName", "timeLeft", "productUrl"],
    updatedAt: "2025-02-02",
    color: "from-fuchsia-500 to-pink-500",
  },
];
