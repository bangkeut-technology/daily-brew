"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiAxios } from "@/lib/api";
import type { AdminDashboardData, AdminPagedResponse, AdminUserRow } from "@/types/admin";

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => (await apiAxios.get<AdminDashboardData>("/admin/dashboard")).data,
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
