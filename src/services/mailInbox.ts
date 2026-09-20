import getMailApiClient from "./mailApiClient";
import type { ThreadSummary, ThreadDetail, ThreadMessage } from "./inbox";

export const listMyThreadsService = async (params?: {
  page?: number;
  pageSize?: number;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", String(params.page));
  if (params?.pageSize) queryParams.append("pageSize", String(params.pageSize));
  const query = queryParams.toString() ? `?${queryParams.toString()}` : "";

  const { data } = await getMailApiClient().get<any>(
    `/api/mail/threads${query}`,
  );
  return {
    threads: data.data as ThreadSummary[],
    total: (data.meta?.total as number) ?? data.data.length,
  };
};

export const getMyThreadService = async (threadId: string) => {
  const { data } = await getMailApiClient().get<any>(
    `/api/mail/threads/${threadId}`,
  );
  return data.data as ThreadDetail;
};

export const replyMyThreadService = async (
  threadId: string,
  payload: { body: string; html?: string; cc?: string[] },
) => {
  const { data } = await getMailApiClient().post<any>(
    `/api/mail/threads/${threadId}/reply`,
    payload,
  );
  return data.data as ThreadMessage;
};
