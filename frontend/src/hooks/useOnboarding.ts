"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios } from "@/lib/api";
import type { Workspace } from "@/types/auth";

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const { data } = await apiAxios.post<Workspace>("/workspaces", { name, timezone });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}

export function useCompleteOnboarding() {
  return useMutation({
    mutationFn: async () => {
      await apiAxios.post("/users/me/complete-onboarding");
    },
  });
}
