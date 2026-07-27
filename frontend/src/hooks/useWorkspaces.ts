"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiAxios } from "@/lib/api";
import type { Workspace } from "@/types/workspace";

export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => (await apiAxios.get<Workspace[]>("/workspaces")).data,
  });
}

export function useWorkspace(publicId: string) {
  return useQuery({
    queryKey: ["workspaces", publicId],
    queryFn: async () => (await apiAxios.get<Workspace>(`/workspaces/${publicId}`)).data,
    enabled: !!publicId,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      // The server validates the IANA id and falls back to Asia/Phnom_Penh —
      // sending the browser's guess just saves the owner a settings trip.
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return (await apiAxios.post<Workspace>("/workspaces", { name, timezone })).data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspaces"] }),
  });
}
