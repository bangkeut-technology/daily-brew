import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiAxios } from '@/lib/apiAxios';
import type { ClosurePeriod } from '@/types';

export function useClosures(workspacePublicId: string) {
  return useQuery({
    queryKey: ['closures', workspacePublicId],
    queryFn: async () => {
      const { data } = await apiAxios.get<ClosurePeriod[]>(
        `/workspaces/${workspacePublicId}/closures`,
      );
      return data;
    },
    enabled: !!workspacePublicId,
  });
}

export function useCreateClosure(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (closure: { name: string; startDate: string; endDate: string }) => {
      const { data } = await apiAxios.post<ClosurePeriod>(
        `/workspaces/${workspacePublicId}/closures`,
        closure,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['closures', workspacePublicId] });
    },
  });
}

export function useUpdateClosure(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      publicId,
      ...closure
    }: {
      publicId: string;
      name?: string;
      startDate?: string;
      endDate?: string;
    }) => {
      const { data } = await apiAxios.put<ClosurePeriod>(
        `/workspaces/${workspacePublicId}/closures/${publicId}`,
        closure,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['closures', workspacePublicId] });
    },
  });
}

export function useDeleteClosure(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (publicId: string) => {
      await apiAxios.delete(`/workspaces/${workspacePublicId}/closures/${publicId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['closures', workspacePublicId] });
    },
  });
}
