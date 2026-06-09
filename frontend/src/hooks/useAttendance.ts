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

/**
 * Soft-deletes an attendance row. The row stays in the database with
 * voidedAt/By/Reason populated so it's still in the log as a tombstone,
 * but it's dropped from dashboard stats and exports. A new QR scan or
 * manual entry on the same day resurrects it (clears the void fields).
 */
export function useDeleteAttendance(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ publicId, reason }: { publicId: string; reason: string }) =>
      (
        await apiAxios.delete<AttendanceRecord>(
          `/workspaces/${workspacePublicId}/attendances/${publicId}`,
          { data: { reason } },
        )
      ).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance", workspacePublicId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
