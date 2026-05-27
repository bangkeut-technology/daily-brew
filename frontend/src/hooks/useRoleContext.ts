"use client";

import { useQuery } from "@tanstack/react-query";
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
