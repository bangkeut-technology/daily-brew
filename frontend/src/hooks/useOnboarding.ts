"use client";

import { useMutation } from "@tanstack/react-query";
import { apiAxios } from "@/lib/api";

// Onboarding and the no-workspace dashboard create workspaces the same way;
// one implementation lives in useWorkspaces.
export { useCreateWorkspace } from "@/hooks/useWorkspaces";

export function useCompleteOnboarding() {
  return useMutation({
    mutationFn: async () => {
      await apiAxios.post("/users/me/complete-onboarding");
    },
  });
}
