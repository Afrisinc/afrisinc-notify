import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listOrgThreadsService,
  getOrgThreadService,
  composeOrgThreadService,
  replyOrgThreadService,
  type ComposeThreadPayload,
} from "@/services/inbox";

export function useOrgThreads(
  orgId: string | undefined,
  params?: { page?: number; pageSize?: number },
) {
  return useQuery({
    queryKey: ["orgThreads", orgId, params],
    queryFn: () => listOrgThreadsService(orgId!, params),
    refetchInterval: 20000,
  });
}

export function useOrgThread(
  orgId: string | undefined,
  threadId: string | undefined,
) {
  return useQuery({
    queryKey: ["orgThread", orgId, threadId],
    queryFn: () => getOrgThreadService(orgId!, threadId!),
    enabled: !!orgId && !!threadId,
    refetchInterval: 8000,
  });
}

export function useComposeOrgThread(orgId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ComposeThreadPayload) =>
      composeOrgThreadService(orgId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orgThreads", orgId] });
    },
  });
}

export function useReplyToOrgThread(
  orgId: string | undefined,
  threadId: string | undefined,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { body: string; html?: string; cc?: string[] }) =>
      replyOrgThreadService(orgId!, threadId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["orgThread", orgId, threadId],
      });
      queryClient.invalidateQueries({ queryKey: ["orgThreads", orgId] });
    },
  });
}
