"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export interface AttendanceOverridePayload {
  /** "HH:MM" workspace-local; null clears, undefined leaves untouched. */
  checkInAt?: string | null;
  checkOutAt?: string | null;
  reason: string;
}

export function useOverrideAttendance(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ publicId, payload }: { publicId: string; payload: AttendanceOverridePayload }) =>
      (
        await apiAxios.patch<AttendanceRecord>(
          `/workspaces/${workspacePublicId}/attendances/${publicId}`,
          payload,
        )
      ).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["attendance", workspacePublicId] }),
  });
}

export interface AttendanceCreatePayload {
  employeePublicId: string;
  /** "YYYY-MM-DD" workspace-local calendar date. */
  date: string;
  /** "HH:MM" workspace-local; required. */
  checkInAt: string;
  checkOutAt?: string | null;
  reason: string;
}

export function useCreateAttendance(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AttendanceCreatePayload) =>
      (await apiAxios.post<AttendanceRecord>(`/workspaces/${workspacePublicId}/attendances`, payload))
        .data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["attendance", workspacePublicId] }),
  });
}
