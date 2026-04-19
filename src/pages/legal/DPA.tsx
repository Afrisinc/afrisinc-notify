import { LegalPage } from "@/components/public/legal/LegalPage";

const sections = [
  { id: "scope", title: "1. Scope & Purpose", content: "This Data Processing Agreement ('DPA') forms part of the Terms of Service between you ('Controller') and AfriSinc Technologies ('Processor'). It governs the processing of personal data in connection with the Notify platform." },
  { id: "definitions", title: "2. Definitions", content: "Personal Data, Processing, Data Subject, Controller, and Processor have the meanings given in the GDPR (EU 2016/679) and the Rwanda Data Protection Act 2019. 'Services' refers to the Notify platform." },
  { id: "obligations", title: "3. Processor Obligations", content: "We process personal data only on your documented instructions, ensure personnel are bound by confidentiality, implement appropriate technical and organizational security measures, assist with data subject requests, and delete or return data upon termination." },
  { id: "subprocessors", title: "4. Sub-processors", content: "We maintain a list of approved sub-processors available upon request. We'll notify you 30 days before adding new sub-processors, giving you the right to object. All sub-processors are bound by equivalent data protection obligations." },
  { id: "transfers", title: "5. International Transfers", content: "Where personal data is transferred outside the EEA or Rwanda, we ensure adequate safeguards through Standard Contractual Clauses (SCCs), adequacy decisions, or other approved transfer mechanisms." },
  { id: "security", title: "6. Security Measures", content: "We implement encryption at rest and in transit, access controls, regular security assessments, incident detection and response, backup and recovery procedures, and employee security training." },
  { id: "breach", title: "7. Data Breach Notification", content: "We will notify you of any personal data breach without undue delay and no later than 48 hours after becoming aware. Notification includes the nature of the breach, categories of data affected, and remedial measures taken." },
  { id: "audit", title: "8. Audit Rights", content: "You may audit our compliance with this DPA upon reasonable notice. We will provide necessary information and cooperate with audits conducted by you or an appointed third-party auditor, subject to confidentiality obligations." },
];

const DPA = () => (
  <LegalPage title="Data Processing Agreement" lastUpdated="March 1, 2026" sections={sections} />
);

export default DPA;
