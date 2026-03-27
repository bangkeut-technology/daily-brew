import { useQuery } from '@tanstack/react-query';
import { apiAxios } from '@/lib/apiAxios';
import type { DashboardStats } from '@/types';

export function useDashboard(workspacePublicId: string) {
  return useQuery({
    queryKey: ['dashboard', workspacePublicId],
    queryFn: async () => {
      const { data } = await apiAxios.get<DashboardStats>(
        `/workspaces/${workspacePublicId}/dashboard`,
      );
      return data;
    },
    enabled: !!workspacePublicId,
    refetchInterval: 30000,
  });
}
