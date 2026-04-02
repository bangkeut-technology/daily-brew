import { useQuery } from '@tanstack/react-query';
import { apiAxios } from '@/lib/apiAxios';
import type { AttendanceSummaryEmployee } from '@/types';

export function useAttendanceSummary(
  workspacePublicId: string,
  from: string,
  to: string,
) {
  return useQuery({
    queryKey: ['attendance-summary', workspacePublicId, from, to],
    queryFn: async () => {
      const { data } = await apiAxios.get<AttendanceSummaryEmployee[]>(
        `/workspaces/${workspacePublicId}/attendances/summary`,
        { params: { from, to } },
      );
      return data;
    },
    enabled: !!workspacePublicId,
  });
}
