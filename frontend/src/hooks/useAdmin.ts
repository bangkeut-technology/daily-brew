"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiAxios } from "@/lib/api";
import type {
  AdminAuditLogResponse,
  AdminChurnData,
  AdminDashboardData,
  AdminFeatureFlagRow,
  AdminFeatureFlagStageOption,
  AdminMobileAppConfig,
  AdminMobileAppConfigInput,
  AdminPagedResponse,
  AdminSubscriptionRow,
  AdminUserDetail,
  AdminUserRow,
  AdminWorkspaceDetail,
  AdminWorkspaceRow,
  FeatureFlagStage,
  WorkspacePlan,
  WorkspaceTestingTrack,
} from "@/types/admin";

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => (await apiAxios.get<AdminDashboardData>("/admin/dashboard")).data,
  });
}

export function useAdminWorkspaces(
  params: { page?: number; search?: string; includeDeleted?: boolean } = {},
) {
  return useQuery({
    queryKey: ["admin", "workspaces", params],
    queryFn: async () =>
      (await apiAxios.get<AdminPagedResponse<AdminWorkspaceRow>>("/admin/workspaces", { params }))
        .data,
    placeholderData: (prev) => prev,
  });
}

export function useAdminWorkspace(publicId: string) {
  return useQuery({
    queryKey: ["admin", "workspace", publicId],
    queryFn: async () =>
      (await apiAxios.get<AdminWorkspaceDetail>(`/admin/workspaces/${publicId}`)).data,
    enabled: !!publicId,
  });
}

export function useCancelWorkspaceSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (publicId: string) =>
      (
        await apiAxios.post<{ status: string; canceledAt: string | null }>(
          `/admin/workspaces/${publicId}/cancel-subscription`,
        )
      ).data,
    onSuccess: (_data, publicId) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "workspace", publicId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit-log"] });
    },
  });
}

export function useUpdateAdminWorkspaceTestingTrack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ publicId, track }: { publicId: string; track: WorkspaceTestingTrack }) =>
      (
        await apiAxios.put<{ publicId: string; testingTrack: WorkspaceTestingTrack }>(
          `/admin/workspaces/${publicId}/testing-track`,
          { track },
        )
      ).data,
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "workspace", vars.publicId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit-log"] });
      queryClient.invalidateQueries({ queryKey: ["features"] });
    },
  });
}

export function useUpdateAdminWorkspacePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ publicId, plan }: { publicId: string; plan: WorkspacePlan }) =>
      (
        await apiAxios.put<{ publicId: string; plan: WorkspacePlan }>(
          `/admin/workspaces/${publicId}/plan`,
          { plan },
        )
      ).data,
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "workspace", vars.publicId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit-log"] });
    },
  });
}

export function useAdminSubscriptions(
  params: { page?: number; status?: string; plan?: string } = {},
) {
  return useQuery({
    queryKey: ["admin", "subscriptions", params],
    queryFn: async () =>
      (await apiAxios.get<AdminPagedResponse<AdminSubscriptionRow>>("/admin/subscriptions", { params }))
        .data,
    placeholderData: (prev) => prev,
  });
}

export function useAdminChurn(params: { days?: number; page?: number } = {}) {
  return useQuery({
    queryKey: ["admin", "churn", params],
    queryFn: async () => (await apiAxios.get<AdminChurnData>("/admin/churn", { params })).data,
    placeholderData: (prev) => prev,
  });
}

export function useAdminAuditLog(
  params: { page?: number; action?: string; targetType?: string } = {},
) {
  return useQuery({
    queryKey: ["admin", "audit-log", params],
    queryFn: async () =>
      (await apiAxios.get<AdminAuditLogResponse>("/admin/audit-log", { params })).data,
    placeholderData: (prev) => prev,
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
    onSuccess: (_data, publicId) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "workspace", publicId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit-log"] });
    },
  });
}

export function useAdminUsers(
  params: { page?: number; search?: string; superAdminOnly?: boolean } = {},
) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: async () => {
      const { data } = await apiAxios.get<AdminPagedResponse<AdminUserRow>>("/admin/users", {
        params,
      });
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useAdminUser(publicId: string) {
  return useQuery({
    queryKey: ["admin", "user", publicId],
    queryFn: async () => (await apiAxios.get<AdminUserDetail>(`/admin/users/${publicId}`)).data,
    enabled: !!publicId,
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
    onSuccess: (_data, publicId) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "user", publicId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit-log"] });
    },
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
    onSuccess: (_data, publicId) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "user", publicId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit-log"] });
    },
  });
}
