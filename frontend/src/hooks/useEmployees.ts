"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiAxios } from "@/lib/api";
import type { Employee } from "@/types/employee";

export function useEmployees(workspacePublicId: string) {
  return useQuery({
    queryKey: ["employees", workspacePublicId],
    queryFn: async () => {
      const { data } = await apiAxios.get<Employee[]>(
        `/workspaces/${workspacePublicId}/employees`,
      );
      return data;
    },
    enabled: !!workspacePublicId,
  });
}

export function useDeleteEmployee(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (publicId: string) => {
      await apiAxios.delete(`/workspaces/${workspacePublicId}/employees/${publicId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees", workspacePublicId] });
    },
  });
}
