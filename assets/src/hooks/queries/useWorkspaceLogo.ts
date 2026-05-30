import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiAxios } from '@/lib/apiAxios';

interface LogoResponse {
  publicId: string;
  logoUrl: string | null;
}

function logoUrl(workspacePublicId: string): string {
  return `/workspaces/${workspacePublicId}/logo`;
}

/**
 * Multipart upload — see useUserAvatar for why Content-Type is forced to
 * undefined (so axios delegates to the browser's multipart boundary writer).
 */
export function useUploadWorkspaceLogo(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const body = new FormData();
      body.append('file', file);
      const { data } = await apiAxios.post<LogoResponse>(logoUrl(workspacePublicId), body, {
        headers: { 'Content-Type': undefined } as any,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspacePublicId] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useRemoveWorkspaceLogo(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiAxios.delete<LogoResponse>(logoUrl(workspacePublicId));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces', workspacePublicId] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}
