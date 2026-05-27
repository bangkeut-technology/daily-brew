"use client";

import { useQuery } from "@tanstack/react-query";
import { apiAxios } from "@/lib/api";
import type { AttendanceRecord } from "@/types/attendance";

export function useAttendance(workspacePublicId: string, from: string, to: string) {
  return useQuery({
    queryKey: ["attendance", workspacePublicId, from, to],
    queryFn: async () => {
      const { data } = await apiAxios.get<AttendanceRecord[]>(
        `/workspaces/${workspacePublicId}/attendances`,
        { params: { from, to } },
      );
      return data;
    },
    enabled: !!workspacePublicId && !!from && !!to,
  });
}
