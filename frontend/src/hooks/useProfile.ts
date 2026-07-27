"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiAxios } from "@/lib/api";
import { useAuthDispatch } from "@/providers/auth-provider";
import type { User } from "@/types/auth";

const AVATAR_URL = "/users/me/avatar";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const dispatch = useAuthDispatch();
  return useMutation({
    mutationFn: async (data: { firstName?: string; lastName?: string; locale?: string }) =>
      (await apiAxios.put<User>("/users/me", data)).data,
    onSuccess: (user) => {
      // Push into auth state as well as the cache — the shell reads the user
      // from the reducer, not from a query.
      dispatch({ type: "UPDATE_USER", user });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) =>
      (await apiAxios.post("/users/me/change-password", data)).data,
  });
}

/**
 * Multipart upload — Content-Type is forced to undefined so axios stops
 * applying its JSON default and the browser writes the multipart boundary.
 */
export function useUploadUserAvatar() {
  const queryClient = useQueryClient();
  const dispatch = useAuthDispatch();
  return useMutation({
    mutationFn: async (file: File) => {
      const body = new FormData();
      body.append("file", file);
      const { data } = await apiAxios.post<User>(AVATAR_URL, body, {
        headers: { "Content-Type": undefined } as never,
      });
      return data;
    },
    onSuccess: (user) => {
      dispatch({ type: "UPDATE_USER", user });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useRemoveUserAvatar() {
  const queryClient = useQueryClient();
  const dispatch = useAuthDispatch();
  return useMutation({
    mutationFn: async () => (await apiAxios.delete<User>(AVATAR_URL)).data,
    onSuccess: (user) => {
      dispatch({ type: "UPDATE_USER", user });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useOAuthConnections() {
  return useQuery({
    queryKey: ["oauth-connections"],
    queryFn: async () =>
      (
        await apiAxios.get<{ google: boolean; apple: boolean; hasPassword: boolean }>(
          "/users/me/oauth",
        )
      ).data,
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
    mutationFn: async () => (await apiAxios.post("/users/me/oauth/link-token")).data,
  });
}

export function useDisconnectOAuth() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (provider: "google" | "apple") =>
      (await apiAxios.delete(`/users/me/oauth/${provider}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["oauth-connections"] }),
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => (await apiAxios.delete("/users/me")).data,
  });
}

export function useUnlinkEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (employeePublicId: string) =>
      (await apiAxios.post("/users/me/unlink-employee", { employeePublicId })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["role-context"] }),
  });
}

// ── Personal Telegram connection ────────────────────────────────

/**
 * While the user is mid-link (waiting for them to tap Start in Telegram) the
 * caller bumps refetchInterval so the chat-ID flip is detected without a
 * page reload.
 */
export function useTelegramConnectionStatus(options?: { refetchInterval?: number | false }) {
  return useQuery({
    queryKey: ["user-telegram"],
    queryFn: async () => (await apiAxios.get<{ connected: boolean }>("/users/me/telegram")).data,
    refetchInterval: options?.refetchInterval ?? false,
  });
}

export function useTelegramLinkToken() {
  return useMutation({
    mutationFn: async () =>
      (
        await apiAxios.post<{ token: string; deepLink: string; expiresInSeconds: number }>(
          "/users/me/telegram/link-token",
        )
      ).data,
  });
}

export function useDisconnectTelegram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      (await apiAxios.delete<{ disconnected: boolean }>("/users/me/telegram")).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-telegram"] }),
  });
}
