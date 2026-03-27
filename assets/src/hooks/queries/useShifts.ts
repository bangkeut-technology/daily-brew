import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiAxios } from '@/lib/apiAxios';
import type { Shift, ShiftTimeRule } from '@/types';

export function useShifts(workspacePublicId: string) {
  return useQuery({
    queryKey: ['shifts', workspacePublicId],
    queryFn: async () => {
      const { data } = await apiAxios.get<Shift[]>(
        `/workspaces/${workspacePublicId}/shifts`,
      );
      return data;
    },
    enabled: !!workspacePublicId,
  });
}

export function useCreateShift(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (shift: { name: string; startTime: string; endTime: string }) => {
      const { data } = await apiAxios.post<Shift>(
        `/workspaces/${workspacePublicId}/shifts`,
        shift,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts', workspacePublicId] });
    },
  });
}

export function useUpdateShift(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      publicId,
      ...shift
    }: {
      publicId: string;
      name?: string;
      startTime?: string;
      endTime?: string;
    }) => {
      const { data } = await apiAxios.put<Shift>(
        `/workspaces/${workspacePublicId}/shifts/${publicId}`,
        shift,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts', workspacePublicId] });
    },
  });
}

export function useDeleteShift(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (publicId: string) => {
      await apiAxios.delete(`/workspaces/${workspacePublicId}/shifts/${publicId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts', workspacePublicId] });
    },
  });
}

// ── ShiftTimeRule mutations (Brew+ only) ───────────────────

export function useCreateShiftTimeRule(workspacePublicId: string, shiftPublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rule: { dayOfWeek: number; startTime: string; endTime: string }) => {
      const { data } = await apiAxios.post<ShiftTimeRule>(
        `/workspaces/${workspacePublicId}/shifts/${shiftPublicId}/time-rules`,
        rule,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts', workspacePublicId] });
    },
  });
}

export function useUpdateShiftTimeRule(workspacePublicId: string, shiftPublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      publicId,
      ...rule
    }: {
      publicId: string;
      startTime?: string;
      endTime?: string;
    }) => {
      const { data } = await apiAxios.put<ShiftTimeRule>(
        `/workspaces/${workspacePublicId}/shifts/${shiftPublicId}/time-rules/${publicId}`,
        rule,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts', workspacePublicId] });
    },
  });
}

export function useDeleteShiftTimeRule(workspacePublicId: string, shiftPublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (publicId: string) => {
      await apiAxios.delete(
        `/workspaces/${workspacePublicId}/shifts/${shiftPublicId}/time-rules/${publicId}`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts', workspacePublicId] });
    },
  });
}
