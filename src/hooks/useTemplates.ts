/**
 * React Query Hooks for Templates API
 * Provides data fetching, caching, and state management
 */

import { useQuery, useMutation, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { Template } from '@/types/templates';
import {
  fetchTemplates,
  fetchTemplate,
  searchTemplates,
  fetchTemplatesByChannel,
  fetchUserProjects,
  getTemplateById,
  createProject,
  updateProject,
  deleteProject,
  getProject,
} from '@/services/templatesService';

/**
 * Query key factory for templates
 */
const templatesQueryKeys = {
  all: () => ['templates'],
  lists: () => [...templatesQueryKeys.all(), 'list'],
  list: (filters: any) => [...templatesQueryKeys.lists(), filters],
  details: () => [...templatesQueryKeys.all(), 'detail'],
  detail: (slug: string) => [...templatesQueryKeys.details(), slug],
  search: (query: string, channel?: string) => [...templatesQueryKeys.all(), 'search', { query, channel }],
  channel: (channel: string) => [...templatesQueryKeys.all(), 'channel', channel],
  projects: () => [...templatesQueryKeys.all(), 'projects'],
};

/**
 * Hook to fetch all templates with pagination and filtering
 */
export function useTemplates(
  options: {
    limit?: number;
    offset?: number;
    channel?: string;
    search?: string;
    enabled?: boolean;
  } = {}
): UseQueryResult<{ templates: Template[]; total: number }> {
  const { limit = 20, offset = 0, channel, search, enabled = true } = options;

  return useQuery({
    queryKey: templatesQueryKeys.list({ limit, offset, channel, search }),
    queryFn: () =>
      fetchTemplates({
        limit,
        offset,
        channel,
        search,
      }),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });
}

/**
 * Hook to fetch a single template by slug
 */
export function useTemplate(
  slug: string | null | undefined,
  options: { enabled?: boolean } = {}
): UseQueryResult<Template> {
  const { enabled = !!slug } = options;

  return useQuery({
    queryKey: templatesQueryKeys.detail(slug || ''),
    queryFn: () => fetchTemplate(slug!),
    enabled: enabled && !!slug,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to fetch a single template by ID
 */
export function useTemplateById(
  id: string | null | undefined,
  options: { enabled?: boolean } = {}
): UseQueryResult<Template> {
  const { enabled = !!id } = options;

  return useQuery({
    queryKey: [...templatesQueryKeys.all(), 'byId', id],
    queryFn: () => getTemplateById(id!),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

/**
 * Hook to search templates
 */
export function useSearchTemplates(
  query: string,
  options: {
    channel?: string;
    limit?: number;
    offset?: number;
    enabled?: boolean;
  } = {}
): UseQueryResult<{ templates: Template[]; total: number }> {
  const { channel, limit = 20, offset = 0, enabled = !!query } = options;

  return useQuery({
    queryKey: templatesQueryKeys.search(query, channel),
    queryFn: () =>
      searchTemplates({
        search: query,
        channel,
        limit,
        offset,
      }),
    enabled: enabled && !!query,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch templates by channel
 */
export function useTemplatesByChannel(
  channel: string,
  options: {
    limit?: number;
    offset?: number;
    enabled?: boolean;
  } = {}
): UseQueryResult<{ templates: Template[]; total: number }> {
  const { limit = 20, offset = 0, enabled = !!channel } = options;

  return useQuery({
    queryKey: templatesQueryKeys.channel(channel),
    queryFn: () =>
      fetchTemplatesByChannel({
        channel,
        limit,
        offset,
      }),
    enabled: enabled && !!channel,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch user projects
 */
export function useUserProjects(
  options: { enabled?: boolean } = {}
): UseQueryResult<any[]> {
  const { enabled = true } = options;

  return useQuery({
    queryKey: templatesQueryKeys.projects(),
    queryFn: () => fetchUserProjects(),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to create a new project
 */
export function useCreateProject(): UseMutationResult<any, Error, { name: string; description?: string }> {
  return useMutation({
    mutationFn: (data) => createProject(data),
    onSuccess: () => {
      // Invalidate projects list to refetch
      // This would need queryClient from React Query
    },
  });
}

/**
 * Hook to update a project
 */
export function useUpdateProject(
  id: string
): UseMutationResult<any, Error, { name?: string; description?: string }> {
  return useMutation({
    mutationFn: (data) => updateProject(id, data),
  });
}

/**
 * Hook to delete a project
 */
export function useDeleteProject(): UseMutationResult<void, Error, string> {
  return useMutation({
    mutationFn: (id) => deleteProject(id),
  });
}

/**
 * Hook to fetch a single project
 */
export function useProject(
  id: string | null | undefined,
  options: { enabled?: boolean } = {}
): UseQueryResult<any> {
  const { enabled = !!id } = options;

  return useQuery({
    queryKey: [...templatesQueryKeys.all(), 'project', id],
    queryFn: () => getProject(id!),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}
