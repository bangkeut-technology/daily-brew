"use client";

import { useQuery } from "@tanstack/react-query";
import { apiAxios } from "@/lib/api";

export interface PlanDetails {
  plan: string;
  planLabel: string;
  isEspresso: boolean;
  isDoubleEspresso: boolean;
  canUseIpRestriction: boolean;
  canUseGeofencing: boolean;
  canUseDeviceVerification: boolean;
  canUseTelegramNotifications: boolean;
  employeeLimit: number | null;
  remainingEmployeeSlots: number | null;
}

export function usePlan(workspacePublicId: string) {
  return useQuery({
    queryKey: ["plan", workspacePublicId],
    queryFn: async () => {
      const { data } = await apiAxios.get<PlanDetails>(`/workspaces/${workspacePublicId}/plan`);
      return data;
    },
    enabled: !!workspacePublicId,
  });
}
