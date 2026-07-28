"use client";

import { useQuery } from "@tanstack/react-query";
import { apiAxios } from "@/lib/api";
import type { AttendanceSummaryEmployee } from "@/types/attendance";

/**
 * Per-employee, per-day grid for a date range — the data behind the Monthly
 * and Summary views. Every calendar day resolves to one status, including days
 * with no underlying record (absent / closure / off / upcoming).
 */
export function useAttendanceSummary(workspacePublicId: string, from: string, to: string) {
  return useQuery({
    queryKey: ["attendance-summary", workspacePublicId, from, to],
    queryFn: async () => {
      const { data } = await apiAxios.get<AttendanceSummaryEmployee[]>(
        `/workspaces/${workspacePublicId}/attendances/summary`,
        { params: { from, to } },
      );
      return data;
    },
    enabled: !!workspacePublicId && !!from && !!to,
  });
}
