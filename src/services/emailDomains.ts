import getApiClient from "./apiClient";

export interface EmailSender {
  id: string;
  localPart: string;
  fromName?: string;
  replyToEmail?: string;
  replyToName?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface EmailDomain {
  id: string;
  domain: string;
  selector: string;
  status: "pending" | "verified" | "suspended";
  spfVerified: boolean;
  dkimVerified: boolean;
  dmarcVerified: boolean;
  verifiedAt?: string;
  cloudflareConnected: boolean;
  inboundEnabled: boolean;
  mxVerified: boolean;
  createdAt: string;
  senders: EmailSender[];
}

export interface DomainDNSRecords {
  domain: string;
  spf: { name: string; value: string; verified: boolean };
  dkim: { name: string; value: string; verified: boolean };
  dmarc: { name: string; value: string; verified: boolean };
}

export interface MxRecord {
  domain: string;
  host: string;
  verified: boolean;
}

const withAccount = (accountId?: string) =>
  accountId ? { headers: { "x-account-id": accountId } } : {};

export const listEmailDomainsService = async (
  appId: string,
  accountId?: string,
) => {
  const { data } = await getApiClient().get<any>(
    `/api/apps/${appId}/email-domains`,
    withAccount(accountId),
  );
  return data.data as EmailDomain[];
};

export const addEmailDomainService = async (
  appId: string,
  payload: { domain: string; selector?: string; cloudflareApiToken?: string },
  accountId?: string,
) => {
  const { data } = await getApiClient().post<any>(
    `/api/apps/${appId}/email-domains`,
    payload,
    withAccount(accountId),
  );
  return data.data as { domain: EmailDomain; cloudflare: any };
};

export const getEmailDomainRecordsService = async (
  appId: string,
  domainId: string,
  accountId?: string,
) => {
  const { data } = await getApiClient().get<any>(
    `/api/apps/${appId}/email-domains/${domainId}/records`,
    withAccount(accountId),
  );
  return data.data as DomainDNSRecords;
};

export const verifyEmailDomainService = async (
  appId: string,
  domainId: string,
  accountId?: string,
) => {
  const { data } = await getApiClient().post<any>(
    `/api/apps/${appId}/email-domains/${domainId}/verify`,
    {},
    withAccount(accountId),
  );
  return data.data as EmailDomain;
};

export const deleteEmailDomainService = async (
  appId: string,
  domainId: string,
  accountId?: string,
) => {
  await getApiClient().delete(
    `/api/apps/${appId}/email-domains/${domainId}`,
    withAccount(accountId),
  );
};

export const getInboundMxRecordService = async (
  appId: string,
  domainId: string,
  accountId?: string,
) => {
  const { data } = await getApiClient().get<any>(
    `/api/apps/${appId}/email-domains/${domainId}/mx-record`,
    withAccount(accountId),
  );
  return data.data as MxRecord;
};

export const enableInboundDomainService = async (
  appId: string,
  domainId: string,
  accountId?: string,
) => {
  const { data } = await getApiClient().post<any>(
    `/api/apps/${appId}/email-domains/${domainId}/inbound/enable`,
    {},
    withAccount(accountId),
  );
  return data.data as EmailDomain;
};
