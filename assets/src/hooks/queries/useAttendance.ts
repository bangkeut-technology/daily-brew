import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

export interface AttendanceOverridePayload {
  /** "HH:MM" workspace-local, null to clear, undefined to leave untouched */
  checkInAt?: string | null;
  checkOutAt?: string | null;
  reason: string;
}

export function useOverrideAttendance(workspacePublicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ publicId, payload }: { publicId: string; payload: AttendanceOverridePayload }) => {
      const { data } = await apiAxios.patch<AttendanceRecord>(
        `/workspaces/${workspacePublicId}/attendances/${publicId}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance', workspacePublicId] });
      qc.invalidateQueries({ queryKey: ['attendance-summary', workspacePublicId] });
      qc.invalidateQueries({ queryKey: ['employee-attendance'] });
    },
  });
}

export interface AttendanceCreatePayload {
  employeePublicId: string;
  /** "YYYY-MM-DD" workspace-local calendar date */
  date: string;
  /** "HH:MM" workspace-local; required */
  checkInAt: string;
  /** "HH:MM" workspace-local, or null for no check-out */
  checkOutAt?: string | null;
  reason: string;
}

export function useCreateAttendance(workspacePublicId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AttendanceCreatePayload) => {
      const { data } = await apiAxios.post<AttendanceRecord>(
        `/workspaces/${workspacePublicId}/attendances`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance', workspacePublicId] });
      qc.invalidateQueries({ queryKey: ['attendance-summary', workspacePublicId] });
      qc.invalidateQueries({ queryKey: ['employee-attendance'] });
    },
  });
}
