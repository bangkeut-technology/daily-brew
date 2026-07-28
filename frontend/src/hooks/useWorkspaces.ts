"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiAxios } from "@/lib/api";
import type { ApiToken, ApiTokenCreated, Workspace } from "@/types/workspace";

export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => (await apiAxios.get<Workspace[]>("/workspaces")).data,
  });
}

export function useWorkspace(publicId: string) {
  return useQuery({
    queryKey: ["workspaces", publicId],
    queryFn: async () => (await apiAxios.get<Workspace>(`/workspaces/${publicId}`)).data,
    enabled: !!publicId,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      // The server validates the IANA id and falls back to Asia/Phnom_Penh —
      // sending the browser's guess just saves the owner a settings trip.
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return (await apiAxios.post<Workspace>("/workspaces", { name, timezone })).data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspaces"] }),
  });
}

export function useUpdateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ publicId, name }: { publicId: string; name: string }) =>
      (await apiAxios.put<Workspace>(`/workspaces/${publicId}`, { name })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspaces"] }),
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (publicId: string) => {
      await apiAxios.delete(`/workspaces/${publicId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspaces"] }),
  });
}

export function useRegenerateWorkspaceToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (publicId: string) =>
      (
        await apiAxios.post<{ publicId: string; qrToken: string }>(
          `/workspaces/${publicId}/regenerate-qr-token`,
        )
      ).data,
    // Refetch the workspace list so the QR card renders the new token. Sub-QR
    // tokens are deliberately untouched — they live under their own key.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspaces"] }),
  });
}

/**
 * BasilBook (and any other API consumer) authenticates with workspace-scoped
 * tokens. The list returns active + revoked ones; the plaintext key comes back
 * only from `useCreateApiToken` and is never stored server-side.
 */
export function useApiTokens(workspacePublicId: string) {
  return useQuery({
    queryKey: ["workspaces", workspacePublicId, "api-tokens"],
    queryFn: async () =>
      (await apiAxios.get<ApiToken[]>(`/workspaces/${workspacePublicId}/api-tokens`)).data,
    enabled: !!workspacePublicId,
  });
}

export function useCreateApiToken(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) =>
      (
        await apiAxios.post<ApiTokenCreated>(`/workspaces/${workspacePublicId}/api-tokens`, {
          name,
        })
      ).data,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["workspaces", workspacePublicId, "api-tokens"] }),
  });
}

export function useRevokeApiToken(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tokenPublicId: string) => {
      await apiAxios.delete(`/workspaces/${workspacePublicId}/api-tokens/${tokenPublicId}`);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["workspaces", workspacePublicId, "api-tokens"] }),
  });
}

/** Mints a short-lived deep link that binds a Telegram chat to this workspace. */
export function useWorkspaceTelegramLinkToken(workspacePublicId: string) {
  return useMutation({
    mutationFn: async () =>
      (
        await apiAxios.post<{ token: string; deepLink: string; expiresInSeconds: number }>(
          `/workspaces/${workspacePublicId}/settings/telegram-link-token`,
        )
      ).data,
  });
}

export function useTelegramTest(workspacePublicId: string) {
  return useMutation({
    mutationFn: async () =>
      (
        await apiAxios.post<{ sent: boolean }>(
          `/workspaces/${workspacePublicId}/settings/telegram-test`,
        )
      ).data,
  });
}
