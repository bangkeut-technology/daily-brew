"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiAxios } from "@/lib/api";
import type { ClosurePeriod } from "@/types/closure";

export interface ClosureInput {
  name: string;
  startDate: string;
  endDate: string;
}

export function useClosures(workspacePublicId: string) {
  return useQuery({
    queryKey: ["closures", workspacePublicId],
    queryFn: async () => {
      const { data } = await apiAxios.get<ClosurePeriod[]>(
        `/workspaces/${workspacePublicId}/closures`,
      );
      return data;
    },
    enabled: !!workspacePublicId,
  });
}

export function useCreateClosure(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ClosureInput) => {
      const { data } = await apiAxios.post<ClosurePeriod>(
        `/workspaces/${workspacePublicId}/closures`,
        input,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["closures", workspacePublicId] });
    },
  });
}

export function useUpdateClosure(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ publicId, ...input }: ClosureInput & { publicId: string }) => {
      const { data } = await apiAxios.put<ClosurePeriod>(
        `/workspaces/${workspacePublicId}/closures/${publicId}`,
        input,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["closures", workspacePublicId] });
    },
  });
}

export function useDeleteClosure(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (publicId: string) => {
      await apiAxios.delete(`/workspaces/${workspacePublicId}/closures/${publicId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["closures", workspacePublicId] });
    },
  });
}
