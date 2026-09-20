import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listMyThreadsService,
  getMyThreadService,
  replyMyThreadService,
} from "@/services/mailInbox";

export function useMyThreads(params?: { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: ["myThreads", params],
    queryFn: () => listMyThreadsService(params),
  });
}

export function useMyThread(threadId: string | undefined) {
  return useQuery({
    queryKey: ["myThread", threadId],
    queryFn: () => getMyThreadService(threadId!),
    enabled: !!threadId,
  });
}

export function useReplyToMyThread(threadId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { body: string; html?: string; cc?: string[] }) =>
      replyMyThreadService(threadId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myThread", threadId] });
      queryClient.invalidateQueries({ queryKey: ["myThreads"] });
    },
  });
}
