"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiAxios } from "@/lib/api";
import type { Shift, ShiftTimeRule } from "@/types/shift";

export interface ShiftInput {
  name: string;
  startTime: string;
  endTime: string;
}

export function useShifts(workspacePublicId: string) {
  return useQuery({
    queryKey: ["shifts", workspacePublicId],
    queryFn: async () => {
      const { data } = await apiAxios.get<Shift[]>(`/workspaces/${workspacePublicId}/shifts`);
      return data;
    },
    enabled: !!workspacePublicId,
  });
}

export function useCreateShift(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ShiftInput) => {
      const { data } = await apiAxios.post<Shift>(
        `/workspaces/${workspacePublicId}/shifts`,
        input,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts", workspacePublicId] });
    },
  });
}

export function useUpdateShift(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ publicId, ...input }: ShiftInput & { publicId: string }) => {
      const { data } = await apiAxios.put<Shift>(
        `/workspaces/${workspacePublicId}/shifts/${publicId}`,
        input,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts", workspacePublicId] });
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
      queryClient.invalidateQueries({ queryKey: ["shifts", workspacePublicId] });
    },
  });
}

// ── Per-day time rules (Espresso only) ───────────────────────
//
// All three invalidate the shifts list rather than a rules-specific key: the
// rules ship inside each Shift, so the list is the only cache holding them.

export function useCreateShiftTimeRule(workspacePublicId: string, shiftPublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rule: { dayOfWeek: number; startTime: string; endTime: string }) =>
      (
        await apiAxios.post<ShiftTimeRule>(
          `/workspaces/${workspacePublicId}/shifts/${shiftPublicId}/time-rules`,
          rule,
        )
      ).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts", workspacePublicId] });
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
    }) =>
      (
        await apiAxios.put<ShiftTimeRule>(
          `/workspaces/${workspacePublicId}/shifts/${shiftPublicId}/time-rules/${publicId}`,
          rule,
        )
      ).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts", workspacePublicId] });
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
      queryClient.invalidateQueries({ queryKey: ["shifts", workspacePublicId] });
    },
  });
}
