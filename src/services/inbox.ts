import getApiClient from "./apiClient";

export interface ThreadAttachment {
  id: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  url: string;
}

export interface ThreadMessage {
  id: string;
  direction: "inbound" | "outbound";
  fromAddress: string;
  toAddresses: string[];
  ccAddresses: string[];
  subject?: string;
  textBody?: string;
  htmlBody?: string;
  createdAt: string;
  attachments: ThreadAttachment[];
}

export interface ThreadSummary {
  id: string;
  appId: string;
  appName?: string;
  domain?: string;
  contactEmail: string;
  subject?: string;
  status: "open" | "closed";
  lastMessageAt: string;
}

export interface ThreadDetail extends ThreadSummary {
  messages: ThreadMessage[];
}

export const listOrgThreadsService = async (
  orgId: string,
  params?: { page?: number; pageSize?: number },
) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", String(params.page));
  if (params?.pageSize) queryParams.append("pageSize", String(params.pageSize));
  const query = queryParams.toString() ? `?${queryParams.toString()}` : "";

  const { data } = await getApiClient().get<any>(
    `/api/organizations/${orgId}/inbox/threads${query}`,
  );
  return {
    threads: data.data as ThreadSummary[],
    total: (data.meta?.total as number) ?? data.data.length,
  };
};

export const getOrgThreadService = async (orgId: string, threadId: string) => {
  const { data } = await getApiClient().get<any>(
    `/api/organizations/${orgId}/inbox/threads/${threadId}`,
  );
  return data.data as ThreadDetail;
};

export interface ComposeThreadPayload {
  senderId: string;
  to: string;
  cc?: string[];
  subject: string;
  body: string;
  html?: string;
}

export const composeOrgThreadService = async (
  orgId: string,
  payload: ComposeThreadPayload,
) => {
  const { data } = await getApiClient().post<any>(
    `/api/organizations/${orgId}/inbox/threads`,
    payload,
  );
  return data.data as ThreadDetail;
};

export const replyOrgThreadService = async (
  orgId: string,
  threadId: string,
  payload: { body: string; html?: string; cc?: string[] },
) => {
  const { data } = await getApiClient().post<any>(
    `/api/organizations/${orgId}/inbox/threads/${threadId}/reply`,
    payload,
  );
  return data.data as ThreadMessage;
};
