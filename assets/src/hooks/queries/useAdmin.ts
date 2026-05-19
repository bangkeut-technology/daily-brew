import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiAxios } from '@/lib/apiAxios';
import type {
  AdminAuditLogRow,
  AdminDashboardData,
  AdminMobileAppConfig,
  AdminMobileAppConfigInput,
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

export function useAdminMobileAppConfig() {
  return useQuery({
    queryKey: ['admin-mobile-app-config'],
    queryFn: async () => {
      const { data } = await apiAxios.get<AdminMobileAppConfig>('/admin/mobile-app-config');
      return data;
    },
  });
}

export function useUpdateAdminMobileAppConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: AdminMobileAppConfigInput) => {
      const { data } = await apiAxios.put<AdminMobileAppConfig>('/admin/mobile-app-config', input);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-mobile-app-config'] });
      qc.invalidateQueries({ queryKey: ['admin-audit-log'] });
    },
  });
}

export type FeatureFlagStage = 'dev' | 'alpha' | 'beta' | 'release';

export interface AdminFeatureFlagRow {
  key: string;
  label: string;
  description: string;
  stage: FeatureFlagStage;
  stageLabel: string;
}

export interface AdminFeatureFlagStageOption {
  value: FeatureFlagStage;
  label: string;
  description: string;
}

export function useAdminFeatureFlags() {
  return useQuery({
    queryKey: ['admin-feature-flags'],
    queryFn: async () => {
      const { data } = await apiAxios.get<{
        items: AdminFeatureFlagRow[];
        stages: AdminFeatureFlagStageOption[];
      }>('/admin/feature-flags');
      return data;
    },
  });
}

export function useUpdateAdminFeatureFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, stage }: { key: string; stage: FeatureFlagStage }) => {
      const { data } = await apiAxios.put<AdminFeatureFlagRow>(`/admin/feature-flags/${key}`, { stage });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-feature-flags'] });
      qc.invalidateQueries({ queryKey: ['features'] });
    },
  });
}

export type WorkspaceTestingTrack = 'none' | 'alpha' | 'beta';

export function useUpdateAdminWorkspaceTestingTrack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ publicId, track }: { publicId: string; track: WorkspaceTestingTrack }) => {
      const { data } = await apiAxios.put<{ publicId: string; testingTrack: WorkspaceTestingTrack }>(
        `/admin/workspaces/${publicId}/testing-track`,
        { track },
      );
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-workspace', vars.publicId] });
      qc.invalidateQueries({ queryKey: ['admin-workspaces'] });
      qc.invalidateQueries({ queryKey: ['admin-audit-log'] });
      qc.invalidateQueries({ queryKey: ['features'] });
    },
  });
}
