import { LegalPage } from "@/components/public/legal/LegalPage";

const sections = [
  {
    id: "collection",
    title: "1. Information We Collect",
    content:
      "We collect information you provide directly, such as your name, email address, phone number, and payment information when you create an account or use our services. We also automatically collect usage data including IP addresses, browser type, device information, and interaction logs.",
  },
  {
    id: "use",
    title: "2. How We Use Your Information",
    content:
      "We use your information to provide and improve our services, process transactions, send notifications you've requested, communicate with you about your account, and comply with legal obligations. We may also use aggregated, anonymized data for analytics and service improvement.",
  },
  {
    id: "sharing",
    title: "3. Information Sharing",
    content:
      "We do not sell your personal information. We share data only with service providers who help us operate our platform (e.g., cloud hosting, payment processing), when required by law, or with your explicit consent. All third-party providers are bound by data processing agreements.",
  },
  {
    id: "security",
    title: "4. Data Security",
    content:
      "We implement industry-standard security measures including encryption at rest and in transit (TLS 1.3), regular security audits, access controls, and SOC 2 Type II compliance. We conduct regular penetration testing and maintain an incident response plan.",
  },
  {
    id: "retention",
    title: "5. Data Retention",
    content:
      "We retain your data for as long as your account is active or as needed to provide services. Notification logs are retained according to your plan's retention period (7 days to 1 year). You may request deletion of your data at any time.",
  },
  {
    id: "rights",
    title: "6. Your Rights",
    content:
      "You have the right to access, correct, delete, or export your personal data. You may opt out of marketing communications at any time. For GDPR-covered individuals, you also have the right to restrict processing and data portability. Contact privacy@afrisinc.com to exercise these rights.",
  },
  {
    id: "cookies",
    title: "7. Cookies & Tracking",
    content:
      "We use essential cookies for authentication and security, plus optional analytics cookies to improve our service. You can manage cookie preferences through your browser settings. We do not use third-party advertising trackers.",
  },
  {
    id: "changes",
    title: "8. Changes to This Policy",
    content:
      "We may update this policy from time to time. We'll notify you of material changes via email or in-app notification at least 30 days before they take effect.",
  },
  {
    id: "contact",
    title: "9. Contact Us",
    content:
      "For privacy-related questions, contact our Data Protection Officer at privacy@afrisinc.com or write to: AfriSinc Technologies, Kigali, Rwanda.",
  },
];

const PrivacyPolicy = () => (
  <LegalPage
    title="Privacy Policy"
    lastUpdated="March 1, 2026"
    sections={sections}
  />
);

export default PrivacyPolicy;
