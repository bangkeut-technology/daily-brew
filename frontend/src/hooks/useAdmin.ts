"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiAxios } from "@/lib/api";
import type {
  AdminAuditLogRow,
  AdminDashboardData,
  AdminPagedResponse,
  AdminSubscriptionRow,
  AdminUserRow,
  AdminWorkspaceRow,
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
