"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiAxios } from "@/lib/api";
import type { DashboardTrends } from "@/types/dashboard";

/** Windows the range toggle offers. The API clamps to 30 regardless. */
export const TREND_RANGES = [7, 14, 30] as const;

export type TrendRange = (typeof TREND_RANGES)[number];

export function useDashboardTrends(workspacePublicId: string, days: TrendRange) {
  return useQuery({
    queryKey: ["dashboard-trends", workspacePublicId, days],
    queryFn: async () =>
      (
        await apiAxios.get<DashboardTrends>(
          `/workspaces/${workspacePublicId}/dashboard/trends`,
          { params: { days } },
        )
      ).data,
    enabled: !!workspacePublicId,
    // Switching the range keeps the old window on screen (dimmed by the
    // caller) instead of collapsing the cards back to skeletons.
    placeholderData: keepPreviousData,
    // Historical days don't move; only today's column does. Far less volatile
    // than the live "who's in right now" stats, so it polls much slower.
    staleTime: 5 * 60_000,
  });
}
