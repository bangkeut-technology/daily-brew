"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiV1Axios, getWorkspacePublicId } from "@/lib/api";

/**
 * Local-dev affordance for flipping a workspace's plan without going through
 * Paddle, so plan gating can be exercised end to end. The endpoint itself is
 * dev-environment-only server-side; the UI additionally only renders it on
 * localhost.
 */
export function useDevTogglePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (plan: "free" | "espresso" | "double_espresso") =>
      (
        await apiV1Axios.post("/dev/toggle-plan", {
          workspacePublicId: getWorkspacePublicId(),
          plan,
        })
      ).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["plan"] }),
  });
}
