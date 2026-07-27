"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiAxios, getWorkspacePublicId } from "@/lib/api";
import type { RoleContext } from "@/types/auth";

export function useRoleContext() {
  const workspaceId = getWorkspacePublicId() || "";
  return useQuery({
    queryKey: ["role-context", workspaceId],
    queryFn: async () => {
      const { data } = await apiAxios.get<RoleContext>("/users/me/role-context", {
        params: workspaceId ? { workspaceId } : undefined,
      });
      return data;
    },
  });
}

/**
 * Link the signed-in user to an employee record by its public ID. The server
 * enforces the one-employee-per-workspace uniqueness rule.
 */
export function useLinkEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (employeePublicId: string) =>
      (await apiAxios.post("/users/me/link-employee", { employeePublicId })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["role-context"] }),
  });
}
