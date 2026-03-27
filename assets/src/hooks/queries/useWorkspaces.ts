import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiAxios } from '@/lib/apiAxios';
import type { Workspace, WorkspaceSetting } from '@/types';

export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const { data } = await apiAxios.get<Workspace[]>('/workspaces');
      return data;
    },
  });
}

export function useWorkspace(publicId: string) {
  return useQuery({
    queryKey: ['workspaces', publicId],
    queryFn: async () => {
      const { data } = await apiAxios.get<Workspace>(`/workspaces/${publicId}`);
      return data;
    },
    enabled: !!publicId,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await apiAxios.post<Workspace>('/workspaces', { name });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useWorkspaceSettings(workspacePublicId: string) {
  return useQuery({
    queryKey: ['workspaces', workspacePublicId, 'settings'],
    queryFn: async () => {
      const { data } = await apiAxios.get<WorkspaceSetting>(
        `/workspaces/${workspacePublicId}/settings`,
      );
      return data;
    },
    enabled: !!workspacePublicId,
  });
}

export function useUpdateWorkspaceSettings(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Partial<WorkspaceSetting>) => {
      const { data } = await apiAxios.put<WorkspaceSetting>(
        `/workspaces/${workspacePublicId}/settings`,
        settings,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspacePublicId, 'settings'] });
    },
  });
}
