import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiAxios } from '@/lib/apiAxios';
import type { Workspace, WorkspaceSetting, ApiToken, ApiTokenCreated } from '@/types';

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
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const { data } = await apiAxios.post<Workspace>('/workspaces', { name, timezone });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ publicId, name }: { publicId: string; name: string }) => {
      const { data } = await apiAxios.put<Workspace>(`/workspaces/${publicId}`, { name });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useWorkspaceSettings(
  workspacePublicId: string,
  options?: { refetchInterval?: number | false },
) {
  return useQuery({
    queryKey: ['workspaces', workspacePublicId, 'settings'],
    queryFn: async () => {
      const { data } = await apiAxios.get<WorkspaceSetting>(
        `/workspaces/${workspacePublicId}/settings`,
      );
      return data;
    },
    enabled: !!workspacePublicId,
    refetchInterval: options?.refetchInterval ?? false,
  });
}

export function useRegenerateWorkspaceToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (publicId: string) => {
      const { data } = await apiAxios.post<{ publicId: string; qrToken: string }>(
        `/workspaces/${publicId}/regenerate-qr-token`,
      );
      return data;
    },
    onSuccess: () => {
      // Refetch the workspace list so the QR card on /console/settings renders
      // the new token. Sub-QR tokens are intentionally not affected — they live
      // under a separate query key.
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (publicId: string) => {
      await apiAxios.delete(`/workspaces/${publicId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
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

/**
 * Mint a short-lived workspace-scope Telegram link token. Used by the
 * settings page to open `t.me/<bot>?startgroup=<token>` so the owner can
 * pick a group, the bot joins it, and /start <token> fires server-side
 * to store the group's chat ID + flip telegramNotificationsEnabled.
 *
 * Mirrors useTelegramLinkToken() (user-scope) in useProfile.ts.
 */
export function useWorkspaceTelegramLinkToken(workspacePublicId: string) {
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiAxios.post<{
        token: string;
        deepLink: string;
        expiresInSeconds: number;
      }>(`/workspaces/${workspacePublicId}/settings/telegram-link-token`);
      return data;
    },
  });
}

/**
 * BasilBook (and any other API consumer) authenticates with workspace-scoped
 * API tokens. List returns active + revoked tokens; the plaintext key is only
 * ever returned by useCreateApiToken() and is never stored server-side.
 */
export function useApiTokens(workspacePublicId: string) {
  return useQuery({
    queryKey: ['workspaces', workspacePublicId, 'api-tokens'],
    queryFn: async () => {
      const { data } = await apiAxios.get<ApiToken[]>(
        `/workspaces/${workspacePublicId}/api-tokens`,
      );
      return data;
    },
    enabled: !!workspacePublicId,
  });
}

export function useCreateApiToken(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await apiAxios.post<ApiTokenCreated>(
        `/workspaces/${workspacePublicId}/api-tokens`,
        { name },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspacePublicId, 'api-tokens'],
      });
    },
  });
}

export function useRevokeApiToken(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tokenPublicId: string) => {
      await apiAxios.delete(`/workspaces/${workspacePublicId}/api-tokens/${tokenPublicId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspacePublicId, 'api-tokens'],
      });
    },
  });
}

export function useTelegramTest(workspacePublicId: string) {
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiAxios.post<{ sent: boolean }>(
        `/workspaces/${workspacePublicId}/settings/telegram-test`,
      );
      return data;
    },
  });
}
