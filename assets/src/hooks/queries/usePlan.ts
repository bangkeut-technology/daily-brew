import { useQuery } from '@tanstack/react-query';
import { apiAxios } from '@/lib/apiAxios';
import type { PlanDetails } from '@/types';

export function usePlan(workspacePublicId: string) {
  return useQuery({
    queryKey: ['plan', workspacePublicId],
    queryFn: async () => {
      const { data } = await apiAxios.get<PlanDetails>(
        `/workspaces/${workspacePublicId}/plan`,
      );
      return data;
    },
    enabled: !!workspacePublicId,
  });
}
