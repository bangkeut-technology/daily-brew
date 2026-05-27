"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiAxios, getWorkspacePublicId } from "@/lib/api";
import { todayInTimezone, startOfMonthInTimezone } from "@/lib/timezone";
import type { WorkspaceSetting } from "@/types/workspace";

export function useWorkspaceSettings(workspacePublicId: string) {
  return useQuery({
    queryKey: ["workspaces", workspacePublicId, "settings"],
    queryFn: async () => {
      const { data } = await apiAxios.get<WorkspaceSetting>(
        `/workspaces/${workspacePublicId}/settings`,
      );
      return data;
    },
    enabled: !!workspacePublicId,
  });
}

export function useUpdateWorkspaceSettings(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Partial<WorkspaceSetting>) => {
      const { data } = await apiAxios.put<WorkspaceSetting>(
        `/workspaces/${workspacePublicId}/settings`,
        settings,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces", workspacePublicId, "settings"] });
    },
  });
}

/**
 * Workspace timezone + derived helpers. Falls back to the browser timezone
 * until settings load.
 */
export function useWorkspaceTimezone() {
  const workspaceId = getWorkspacePublicId() || "";
  const { data: settings } = useWorkspaceSettings(workspaceId);
  const tz = settings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  return useMemo(
    () => ({
      timezone: tz,
      today: () => todayInTimezone(tz),
      startOfMonth: () => startOfMonthInTimezone(tz),
    }),
    [tz],
  );
}
