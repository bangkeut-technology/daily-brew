"use client";

import { useQuery } from "@tanstack/react-query";
import { apiV1Axios } from "@/lib/api";

interface SupportConfig {
  feedbackEnabled: boolean;
}

/**
 * Whether feedback submission is configured on the server.
 *
 * Deployment-level state, not per-user: cached for the session so the console
 * doesn't re-ask on every navigation.
 */
export function useSupportConfig() {
  return useQuery({
    queryKey: ["support-config"],
    queryFn: async () => (await apiV1Axios.get<SupportConfig>("/support/config")).data,
    staleTime: Infinity,
    retry: false,
  });
}
