"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiAxios } from "@/lib/api";
import type { EmployeeCard, EmployeeCardIssueResult } from "@/types/employee-card";

const queryKey = (workspacePublicId: string) => ["employee-cards", workspacePublicId];

export function useEmployeeCards(workspacePublicId: string, enabled = true) {
  return useQuery({
    queryKey: queryKey(workspacePublicId),
    queryFn: async () => {
      const { data } = await apiAxios.get<EmployeeCard[]>(
        `/workspaces/${workspacePublicId}/employee-cards`,
      );
      return data;
    },
    enabled: !!workspacePublicId && enabled,
  });
}

/**
 * The response carries the pass bytes, and they are the only copy: the server
 * derives them from the card row plus the workspace key and never stores them.
 * Show them once — a card that was never written to a tag is re-issued, not
 * recovered.
 */
export function useIssueEmployeeCard(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { employeePublicId: string; label: string }) => {
      const { data } = await apiAxios.post<EmployeeCardIssueResult>(
        `/workspaces/${workspacePublicId}/employee-cards`,
        input,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey(workspacePublicId) });
    },
  });
}

export function useRevokeEmployeeCard(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { publicId: string; reason: string }) => {
      const { data } = await apiAxios.delete<EmployeeCard>(
        `/workspaces/${workspacePublicId}/employee-cards/${input.publicId}`,
        { data: { reason: input.reason } },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey(workspacePublicId) });
    },
  });
}
