"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiAxios } from "@/lib/api";
import type {
  AdminAuditLogRow,
  AdminDashboardData,
  AdminFeatureFlagRow,
  AdminFeatureFlagStageOption,
  AdminMobileAppConfig,
  AdminMobileAppConfigInput,
  AdminPagedResponse,
  AdminSubscriptionRow,
  AdminUserRow,
  AdminWorkspaceRow,
  FeatureFlagStage,
} from "@/types/admin";

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => (await apiAxios.get<AdminDashboardData>("/admin/dashboard")).data,
  });
}

export function useAdminWorkspaces(params: { page?: number; q?: string; includeDeleted?: boolean } = {}) {
  return useQuery({
    queryKey: ["admin", "workspaces", params],
    queryFn: async () =>
      (await apiAxios.get<AdminPagedResponse<AdminWorkspaceRow>>("/admin/workspaces", { params }))
        .data,
  });
}

export function useAdminSubscriptions(params: { page?: number; status?: string } = {}) {
  return useQuery({
    queryKey: ["admin", "subscriptions", params],
    queryFn: async () =>
      (await apiAxios.get<AdminPagedResponse<AdminSubscriptionRow>>("/admin/subscriptions", { params }))
        .data,
  });
}

export function useAdminAuditLog(params: { page?: number } = {}) {
  return useQuery({
    queryKey: ["admin", "audit-log", params],
    queryFn: async () =>
      (await apiAxios.get<AdminPagedResponse<AdminAuditLogRow>>("/admin/audit-log", { params })).data,
  });
}

export function useAdminFeatureFlags() {
  return useQuery({
    queryKey: ["admin", "feature-flags"],
    queryFn: async () =>
      (
        await apiAxios.get<{ items: AdminFeatureFlagRow[]; stages: AdminFeatureFlagStageOption[] }>(
          "/admin/feature-flags",
        )
      ).data,
  });
}

export function useUpdateAdminFeatureFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, stage }: { key: string; stage: FeatureFlagStage }) =>
      (await apiAxios.put<AdminFeatureFlagRow>(`/admin/feature-flags/${key}`, { stage })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "feature-flags"] }),
  });
}

export function useAdminMobileAppConfig() {
  return useQuery({
    queryKey: ["admin", "mobile-app-config"],
    queryFn: async () =>
      (await apiAxios.get<AdminMobileAppConfig>("/admin/mobile-app-config")).data,
  });
}

export function useUpdateAdminMobileAppConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AdminMobileAppConfigInput) =>
      (await apiAxios.put<AdminMobileAppConfig>("/admin/mobile-app-config", input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "mobile-app-config"] }),
  });
}

export function useRestoreWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (publicId: string) => {
      const { data } = await apiAxios.post<{ publicId: string; restoredEmployees: number }>(
        `/admin/workspaces/${publicId}/restore`,
      );
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "workspaces"] }),
  });
}

export function useAdminUsers(params: { page?: number; q?: string } = {}) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: async () => {
      const { data } = await apiAxios.get<AdminPagedResponse<AdminUserRow>>("/admin/users", {
        params,
      });
      return data;
    },
  });
}

export function usePromoteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (publicId: string) => {
      const { data } = await apiAxios.post<{ isSuperAdmin: boolean }>(
        `/admin/users/${publicId}/promote`,
      );
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useDemoteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (publicId: string) => {
      const { data } = await apiAxios.post<{ isSuperAdmin: boolean }>(
        `/admin/users/${publicId}/demote`,
      );
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}
