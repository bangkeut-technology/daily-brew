import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiAxios } from '@/lib/apiAxios';
import type { User } from '@/types';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { firstName?: string; lastName?: string; locale?: string }) => {
      const { data: user } = await apiAxios.put<User>('/users/me', data);
      return user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const { data: result } = await apiAxios.post('/users/me/change-password', data);
      return result;
    },
  });
}

export function useOAuthConnections() {
  return useQuery({
    queryKey: ['oauth-connections'],
    queryFn: async () => {
      const { data } = await apiAxios.get<{
        google: boolean;
        apple: boolean;
        hasPassword: boolean;
      }>('/users/me/oauth');
      return data;
    },
  });
}

export function useConnectOAuth() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ provider, providerId }: { provider: 'google' | 'apple'; providerId: string }) => {
      const body = provider === 'google' ? { googleId: providerId } : { appleId: providerId };
      const { data } = await apiAxios.post(`/users/me/oauth/${provider}`, body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oauth-connections'] });
    },
  });
}

/**
 * Mint a short-lived OAUTH_LINK cookie identifying the current user. Must be
 * called immediately before redirecting to /oauth/connect/{provider} — the
 * regular BEARER cookie is scoped to /api/v1 and wouldn't survive the
 * cross-site POST callback from Apple anyway.
 */
export function useOAuthLinkToken() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiAxios.post('/users/me/oauth/link-token');
      return data;
    },
  });
}

export function useDisconnectOAuth() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (provider: 'google' | 'apple') => {
      const { data } = await apiAxios.delete(`/users/me/oauth/${provider}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oauth-connections'] });
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await apiAxios.post('/auth/forgot-password', { email });
      return data;
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: { token: string; password: string }) => {
      const { data: result } = await apiAxios.post('/auth/reset-password', data);
      return result;
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiAxios.delete('/users/me');
      return data;
    },
  });
}

// ── Personal Telegram connection ────────────────────────────────

/**
 * Status query for the profile page. While the user is mid-link (waiting for
 * them to tap Start in Telegram) the caller bumps refetchInterval so we
 * detect the chat-ID flip without a page reload.
 */
export function useTelegramConnectionStatus(options?: { refetchInterval?: number | false }) {
  return useQuery({
    queryKey: ['user-telegram'],
    queryFn: async () => {
      const { data } = await apiAxios.get<{ connected: boolean }>('/users/me/telegram');
      return data;
    },
    refetchInterval: options?.refetchInterval ?? false,
  });
}

export function useTelegramLinkToken() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiAxios.post<{
        token: string;
        deepLink: string;
        expiresInSeconds: number;
      }>('/users/me/telegram/link-token');
      return data;
    },
  });
}

export function useDisconnectTelegram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await apiAxios.delete<{ disconnected: boolean }>('/users/me/telegram');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-telegram'] });
    },
  });
}
