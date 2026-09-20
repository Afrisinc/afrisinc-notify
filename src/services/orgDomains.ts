import getApiClient from "./apiClient";

export interface OrgEmailSender {
  id: string;
  localPart: string;
  fromName?: string;
  replyToEmail?: string;
  replyToName?: string;
  isActive: boolean;
  assignedUserId?: string | null;
  assignedUser?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  address?: string;
  domainId: string;
  createdAt: string;
}

export interface OrgEmailDomain {
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
  senders: OrgEmailSender[];
}

export interface OrgDomainDNSRecords {
  domain: string;
  spf: { name: string; value: string; verified: boolean };
  dkim: { name: string; value: string; verified: boolean };
  dmarc: { name: string; value: string; verified: boolean };
}

export interface OrgMxRecord {
  domain: string;
  host: string;
  verified: boolean;
}

export const listOrgDomainsService = async (orgId: string) => {
  const { data } = await getApiClient().get<any>(
    `/api/organizations/${orgId}/domains`,
  );
  return data.data as OrgEmailDomain[];
};

export const addOrgDomainService = async (
  orgId: string,
  payload: { domain: string; selector?: string; cloudflareApiToken?: string },
) => {
  const { data } = await getApiClient().post<any>(
    `/api/organizations/${orgId}/domains`,
    payload,
  );
  return data.data as {
    domain: OrgEmailDomain;
    cloudflare: any;
    usedOrgDefault: boolean;
  };
};

// ──────────────────────────────────────────
// ORGANIZATION-LEVEL CLOUDFLARE DEFAULT
// ──────────────────────────────────────────

export interface OrgCloudflareSettings {
  connected: boolean;
}

/** Whether the organization has a default Cloudflare API token configured. */
export const getOrgCloudflareSettingsService = async (orgId: string) => {
  const { data } = await getApiClient().get<any>(
    `/api/organizations/${orgId}/cloudflare-settings`,
  );
  return data.data as OrgCloudflareSettings;
};

/** Set the org-wide default Cloudflare API token - used for any domain added without its own token. */
export const updateOrgCloudflareSettingsService = async (
  orgId: string,
  cloudflareApiToken: string,
) => {
  const { data } = await getApiClient().put<any>(
    `/api/organizations/${orgId}/cloudflare-settings`,
    {
      cloudflareApiToken,
    },
  );
  return data.data as OrgCloudflareSettings;
};

export const deleteOrgCloudflareSettingsService = async (orgId: string) => {
  const { data } = await getApiClient().delete<any>(
    `/api/organizations/${orgId}/cloudflare-settings`,
  );
  return data.data as OrgCloudflareSettings;
};

export const getOrgDomainRecordsService = async (
  orgId: string,
  domainId: string,
) => {
  const { data } = await getApiClient().get<any>(
    `/api/organizations/${orgId}/domains/${domainId}/records`,
  );
  return data.data as OrgDomainDNSRecords;
};

export const verifyOrgDomainService = async (
  orgId: string,
  domainId: string,
) => {
  const { data } = await getApiClient().post<any>(
    `/api/organizations/${orgId}/domains/${domainId}/verify`,
    {},
  );
  return data.data as OrgEmailDomain;
};

export const deleteOrgDomainService = async (
  orgId: string,
  domainId: string,
) => {
  await getApiClient().delete(
    `/api/organizations/${orgId}/domains/${domainId}`,
  );
};

export const getOrgInboundMxRecordService = async (
  orgId: string,
  domainId: string,
) => {
  const { data } = await getApiClient().get<any>(
    `/api/organizations/${orgId}/domains/${domainId}/mx-record`,
  );
  return data.data as OrgMxRecord;
};

export const enableOrgInboundDomainService = async (
  orgId: string,
  domainId: string,
) => {
  const { data } = await getApiClient().post<any>(
    `/api/organizations/${orgId}/domains/${domainId}/inbound/enable`,
    {},
  );
  return data.data as { domain: OrgEmailDomain; cloudflareConfigured: boolean };
};

export const addOrgSenderService = async (
  orgId: string,
  domainId: string,
  payload: {
    localPart: string;
    fromName?: string;
    replyToEmail?: string;
    replyToName?: string;
    assignedUserId?: string;
  },
) => {
  const { data } = await getApiClient().post<any>(
    `/api/organizations/${orgId}/domains/${domainId}/senders`,
    payload,
  );
  return data.data as OrgEmailSender;
};

export const updateOrgSenderService = async (
  orgId: string,
  senderId: string,
  payload: {
    fromName?: string;
    replyToEmail?: string;
    replyToName?: string;
    assignedUserId?: string | null;
  },
) => {
  const { data } = await getApiClient().patch<any>(
    `/api/organizations/${orgId}/senders/${senderId}`,
    payload,
  );
  return data.data as OrgEmailSender;
};

export const deleteOrgSenderService = async (
  orgId: string,
  senderId: string,
) => {
  await getApiClient().delete(
    `/api/organizations/${orgId}/senders/${senderId}`,
  );
};

export const listMySendersService = async (orgId: string) => {
  const { data } = await getApiClient().get<any>(
    `/api/organizations/${orgId}/senders/mine`,
  );
  return data.data as OrgEmailSender[];
};
