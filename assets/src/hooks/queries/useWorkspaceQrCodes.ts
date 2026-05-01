import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiAxios } from '@/lib/apiAxios';
import type { WorkspaceQrCode, WorkspaceQrCodeInput } from '@/types';

const queryKey = (workspacePublicId: string) => ['workspace-qr-codes', workspacePublicId];

export function useWorkspaceQrCodes(workspacePublicId: string) {
  return useQuery({
    queryKey: queryKey(workspacePublicId),
    queryFn: async () => {
      const { data } = await apiAxios.get<WorkspaceQrCode[]>(
        `/workspaces/${workspacePublicId}/qr-codes`,
      );
      return data;
    },
    enabled: !!workspacePublicId,
  });
}

export function useWorkspaceQrCode(workspacePublicId: string, publicId: string) {
  return useQuery({
    queryKey: ['workspace-qr-codes', workspacePublicId, publicId],
    queryFn: async () => {
      const { data } = await apiAxios.get<WorkspaceQrCode>(
        `/workspaces/${workspacePublicId}/qr-codes/${publicId}`,
      );
      return data;
    },
    enabled: !!workspacePublicId && !!publicId,
  });
}

export function useCreateWorkspaceQrCode(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: WorkspaceQrCodeInput) => {
      const { data } = await apiAxios.post<WorkspaceQrCode>(
        `/workspaces/${workspacePublicId}/qr-codes`,
        input,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey(workspacePublicId) });
    },
  });
}

export function useUpdateWorkspaceQrCode(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ publicId, ...input }: WorkspaceQrCodeInput & { publicId: string }) => {
      const { data } = await apiAxios.patch<WorkspaceQrCode>(
        `/workspaces/${workspacePublicId}/qr-codes/${publicId}`,
        input,
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKey(workspacePublicId) });
      queryClient.invalidateQueries({ queryKey: ['workspace-qr-codes', workspacePublicId, variables.publicId] });
    },
  });
}

export function useDeleteWorkspaceQrCode(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (publicId: string) => {
      await apiAxios.delete(`/workspaces/${workspacePublicId}/qr-codes/${publicId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey(workspacePublicId) });
    },
  });
}
