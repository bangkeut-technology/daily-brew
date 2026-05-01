import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiAxios } from '@/lib/apiAxios';
import type {
  AdminAuditLogRow,
  AdminDashboardData,
  AdminPagedResponse,
  AdminSubscriptionRow,
  AdminUserDetail,
  AdminUserRow,
  AdminWorkspaceDetail,
  AdminWorkspaceRow,
} from '@/types';

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const { data } = await apiAxios.get<AdminDashboardData>('/admin/dashboard');
      return data;
    },
  });
}

interface ListParams {
  page?: number;
  search?: string;
}

export function useAdminWorkspaces(params: ListParams & { plan?: string; includeDeleted?: boolean } = {}) {
  return useQuery({
    queryKey: ['admin-workspaces', params],
    queryFn: async () => {
      const { data } = await apiAxios.get<AdminPagedResponse<AdminWorkspaceRow>>('/admin/workspaces', { params });
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useAdminWorkspace(publicId: string) {
  return useQuery({
    queryKey: ['admin-workspace', publicId],
    queryFn: async () => {
      const { data } = await apiAxios.get<AdminWorkspaceDetail>(`/admin/workspaces/${publicId}`);
      return data;
    },
    enabled: !!publicId,
  });
}

export function useCancelWorkspaceSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (publicId: string) => {
      const { data } = await apiAxios.post<{ status: string; canceledAt: string | null }>(
        `/admin/workspaces/${publicId}/cancel-subscription`,
      );
      return data;
    },
    onSuccess: (_data, publicId) => {
      qc.invalidateQueries({ queryKey: ['admin-workspace', publicId] });
      qc.invalidateQueries({ queryKey: ['admin-workspaces'] });
      qc.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      qc.invalidateQueries({ queryKey: ['admin-audit-log'] });
    },
  });
}

export function useRestoreWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (publicId: string) => {
      const { data } = await apiAxios.post<{ publicId: string; deletedAt: null; restoredEmployees: number }>(
        `/admin/workspaces/${publicId}/restore`,
      );
      return data;
    },
    onSuccess: (_data, publicId) => {
      qc.invalidateQueries({ queryKey: ['admin-workspace', publicId] });
      qc.invalidateQueries({ queryKey: ['admin-workspaces'] });
      qc.invalidateQueries({ queryKey: ['admin-audit-log'] });
    },
  });
}

export function useAdminAuditLog(params: ListParams & { action?: string; targetType?: string } = {}) {
  return useQuery({
    queryKey: ['admin-audit-log', params],
    queryFn: async () => {
      const { data } = await apiAxios.get<AdminPagedResponse<AdminAuditLogRow>>('/admin/audit-log', { params });
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useAdminUsers(params: ListParams & { superAdminOnly?: boolean } = {}) {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: async () => {
      const { data } = await apiAxios.get<AdminPagedResponse<AdminUserRow>>('/admin/users', { params });
      return data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useAdminUser(publicId: string) {
  return useQuery({
    queryKey: ['admin-user', publicId],
    queryFn: async () => {
      const { data } = await apiAxios.get<AdminUserDetail>(`/admin/users/${publicId}`);
      return data;
    },
    enabled: !!publicId,
  });
}

export function usePromoteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (publicId: string) => {
      const { data } = await apiAxios.post<{ isSuperAdmin: boolean }>(`/admin/users/${publicId}/promote`);
      return data;
    },
    onSuccess: (_data, publicId) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['admin-user', publicId] });
      qc.invalidateQueries({ queryKey: ['admin-audit-log'] });
    },
  });
}

export function useDemoteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (publicId: string) => {
      const { data } = await apiAxios.post<{ isSuperAdmin: boolean }>(`/admin/users/${publicId}/demote`);
      return data;
    },
    onSuccess: (_data, publicId) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['admin-user', publicId] });
      qc.invalidateQueries({ queryKey: ['admin-audit-log'] });
    },
  });
}

export function useAdminSubscriptions(params: ListParams & { status?: string; plan?: string } = {}) {
  return useQuery({
    queryKey: ['admin-subscriptions', params],
    queryFn: async () => {
      const { data } = await apiAxios.get<AdminPagedResponse<AdminSubscriptionRow>>('/admin/subscriptions', { params });
      return data;
    },
    placeholderData: (prev) => prev,
  });
}
