"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiAxios } from "@/lib/api";
import type { Shift } from "@/types/shift";

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
