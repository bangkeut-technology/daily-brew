"use client";

import { useQuery } from "@tanstack/react-query";
import { apiAxios } from "@/lib/api";
import type { DashboardStats } from "@/types/dashboard";

export function useDashboard(workspacePublicId: string) {
  return useQuery({
    queryKey: ["dashboard", workspacePublicId],
    queryFn: async () =>
      (await apiAxios.get<DashboardStats>(`/workspaces/${workspacePublicId}/dashboard`)).data,
    enabled: !!workspacePublicId,
    // The owner dashboard is a wall-mounted "who's in today" board as much as
    // a page, so it polls rather than waiting for a focus event.
    refetchInterval: 30_000,
  });
}
