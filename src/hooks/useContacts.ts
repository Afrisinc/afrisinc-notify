import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listContactsService,
  createContactService,
  getContactService,
  updateContactService,
  deleteContactService,
  bulkImportContactsService,
  exportContactsService,
  searchContactsService,
  type CreateContactPayload,
  type ListContactsParams,
  type BulkImportPayload,
  type ExportContactsParams,
  type SearchContactsParams,
} from "@/services/contacts";
import { useCurrentAccountId } from "@/hooks/useAuth";

// ──────────────────────────────────────────
// LIST CONTACTS
// ──────────────────────────────────────────

export function useContacts(
  appId: string,
  params?: ListContactsParams,
  options?: { enabled?: boolean },
) {
  const accountId = useCurrentAccountId();

  return useQuery({
    queryKey: ["contacts", appId, accountId, params],
    queryFn: () => listContactsService(appId, params, accountId ?? undefined),
    enabled: (options?.enabled ?? true) && !!appId && !!accountId,
  });
}

// ──────────────────────────────────────────
// GET SINGLE CONTACT
// ──────────────────────────────────────────

export function useContact(
  appId: string,
  contactId: string,
  options?: { enabled?: boolean },
) {
  const accountId = useCurrentAccountId();

  return useQuery({
    queryKey: ["contact", appId, contactId, accountId],
    queryFn: () => getContactService(appId, contactId, accountId ?? undefined),
    enabled:
      (options?.enabled ?? true) && !!appId && !!contactId && !!accountId,
  });
}

// ──────────────────────────────────────────
// CREATE CONTACT
// ──────────────────────────────────────────

export function useCreateContact() {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appId,
      payload,
    }: {
      appId: string;
      payload: CreateContactPayload;
    }) => createContactService(appId, payload, accountId ?? undefined),
    onSuccess: (_data, { appId }) => {
      // Invalidate contacts list to refetch
      queryClient.invalidateQueries({
        queryKey: ["contacts", appId, accountId],
      });
    },
  });
}

// ──────────────────────────────────────────
// UPDATE CONTACT
// ──────────────────────────────────────────

export function useUpdateContact() {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appId,
      contactId,
      payload,
    }: {
      appId: string;
      contactId: string;
      payload: Partial<CreateContactPayload>;
    }) =>
      updateContactService(appId, contactId, payload, accountId ?? undefined),
    onSuccess: (_data, { appId, contactId }) => {
      // Invalidate both specific contact and contacts list
      queryClient.invalidateQueries({
        queryKey: ["contact", appId, contactId],
      });
      queryClient.invalidateQueries({
        queryKey: ["contacts", appId],
      });
    },
  });
}

// ──────────────────────────────────────────
// DELETE CONTACT
// ──────────────────────────────────────────

export function useDeleteContact() {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appId, contactId }: { appId: string; contactId: string }) =>
      deleteContactService(appId, contactId, accountId ?? undefined),
    onSuccess: (_data, { appId }) => {
      // Invalidate contacts list to refetch
      queryClient.invalidateQueries({
        queryKey: ["contacts", appId],
      });
    },
  });
}

// ──────────────────────────────────────────
// BULK IMPORT CONTACTS
// ──────────────────────────────────────────

export function useImportContacts() {
  const accountId = useCurrentAccountId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appId,
      payload,
    }: {
      appId: string;
      payload: BulkImportPayload;
    }) => bulkImportContactsService(appId, payload, accountId ?? undefined),
    onSuccess: (_data, { appId }) => {
      // Invalidate contacts list to refetch
      queryClient.invalidateQueries({
        queryKey: ["contacts", appId],
      });
    },
  });
}

// ──────────────────────────────────────────
// EXPORT CONTACTS
// ──────────────────────────────────────────

export function useExportContacts() {
  const accountId = useCurrentAccountId();

  return useMutation({
    mutationFn: ({
      appId,
      params,
    }: {
      appId: string;
      params?: ExportContactsParams;
    }) => exportContactsService(appId, params, accountId ?? undefined),
  });
}

// ──────────────────────────────────────────
// SEARCH CONTACTS
// ──────────────────────────────────────────

export function useSearchContacts(
  appId: string,
  params?: SearchContactsParams,
  options?: { enabled?: boolean },
) {
  const accountId = useCurrentAccountId();

  return useQuery({
    queryKey: ["contactsSearch", appId, accountId, params],
    queryFn: () =>
      searchContactsService(appId, params!, accountId ?? undefined),
    enabled:
      (options?.enabled ?? true) && !!appId && !!accountId && !!params?.q,
  });
}
