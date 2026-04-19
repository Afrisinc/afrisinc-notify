import { LegalPage } from "@/components/public/legal/LegalPage";

const sections = [
  { id: "acceptance", title: "1. Acceptance of Terms", content: "By accessing or using Notify ('the Service'), you agree to be bound by these Terms of Service. If you're using the Service on behalf of an organization, you represent that you have authority to bind that organization." },
  { id: "service", title: "2. Description of Service", content: "Notify provides a multi-channel notification platform including email, SMS, push, and in-app messaging via API and dashboard. We reserve the right to modify, suspend, or discontinue any aspect of the Service with reasonable notice." },
  { id: "accounts", title: "3. User Accounts", content: "You must provide accurate information when creating an account. You're responsible for maintaining the security of your account credentials and for all activities under your account. Notify us immediately of any unauthorized access." },
  { id: "usage", title: "4. Acceptable Use", content: "You agree not to use the Service to send spam or unsolicited messages, transmit malware, violate any laws, infringe intellectual property rights, or engage in any activity that disrupts the Service. We reserve the right to suspend accounts that violate these terms." },
  { id: "billing", title: "5. Billing & Payments", content: "Paid plans are billed in advance on a monthly or annual basis. All fees are non-refundable except as stated in our refund policy. We may change pricing with 30 days notice. Overages are billed at the per-notification rate for your plan." },
  { id: "sla", title: "6. Service Level Agreement", content: "Enterprise plans include a 99.9% uptime SLA. Service credits are issued for downtime exceeding the SLA. Scheduled maintenance windows (announced 48 hours in advance) are excluded from uptime calculations." },
  { id: "ip", title: "7. Intellectual Property", content: "The Service and all related technology are owned by AfriSinc Technologies. You retain ownership of your content and data. You grant us a limited license to process your data solely to provide the Service." },
  { id: "limitation", title: "8. Limitation of Liability", content: "To the maximum extent permitted by law, AfriSinc's total liability is limited to the amounts paid by you in the 12 months preceding the claim. We are not liable for indirect, incidental, or consequential damages." },
  { id: "termination", title: "9. Termination", content: "Either party may terminate at any time. Upon termination, your right to use the Service ceases. We will make your data available for export for 30 days after termination. After that, data may be permanently deleted." },
  { id: "governing", title: "10. Governing Law", content: "These terms are governed by the laws of Rwanda. Any disputes will be resolved through binding arbitration in Kigali, Rwanda, unless you're eligible for small claims court." },
];

const Terms = () => (
  <LegalPage title="Terms of Service" lastUpdated="March 1, 2026" sections={sections} />
);

export default Terms;
