export interface EmailProvider {
  id: string;
  provider: 'gmail' | 'notify' | 'custom_domain';
  method: "oauth2" | "app_password" | null;
  isActive: boolean;
  // Simple
  fromEmail?: string;
  fromName?: string;
  // Gmail
  gmailEmail?: string;
  gmailAuthMethod?: string;
  oauthTokenExpiry?: string;
  // Custom Domain
  domain?: string;
  domainStatus?: string;
  spfVerified?: boolean;
  dkimVerified?: boolean;
  dmarcVerified?: boolean;
  createdAt: string;
}

export interface SimpleConfigPayload {
  fromEmail: string;
  fromName?: string;
  replyToEmail?: string;
  replyToName?: string;
}

export interface GmailOAuthUrlResponse {
  url: string;
  state: string;
}

export interface GmailOAuthCallbackPayload {
  code: string;
  state: string;
}

export interface GmailAppPasswordPayload {
  email: string;
  appPassword: string;
}
