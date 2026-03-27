import { useQuery } from '@tanstack/react-query';
import { apiAxios } from '@/lib/apiAxios';
import type { AttendanceRecord } from '@/types';

export function useAttendance(
  workspacePublicId: string,
  from: string,
  to: string,
) {
  return useQuery({
    queryKey: ['attendance', workspacePublicId, from, to],
    queryFn: async () => {
      const { data } = await apiAxios.get<AttendanceRecord[]>(
        `/workspaces/${workspacePublicId}/attendances`,
        { params: { from, to } },
      );
      return data;
    },
    enabled: !!workspacePublicId,
  });
}
