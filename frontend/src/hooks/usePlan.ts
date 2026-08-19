"use client";

import { useQuery } from "@tanstack/react-query";
import { apiAxios } from "@/lib/api";

/** Mirrors PlanService::getPlanDetails(). */
export interface PlanDetails {
  plan: string;
  planLabel: string;
  isEspresso: boolean;
  isDoubleEspresso: boolean;
  isTrialing: boolean;
  trialDaysRemaining: number | null;
  trialEndsAt: string | null;
  canUseIpRestriction: boolean;
  canUseGeofencing: boolean;
  canUseLeaveRequests: boolean;
  canUseShiftTimeRules: boolean;
  canUseDeviceVerification: boolean;
  canUseManagers: boolean;
  canUseTelegramNotifications: boolean;
  canUseTapCheckin: boolean;
  canUseCardCheckin: boolean;
  canUseNfcCheckin: boolean;
  canUseSubQrCodes: boolean;
  canExportAttendance: boolean;
  employeeLimit: number | null;
  remainingEmployeeSlots: number | null;
  managerLimit: number | null;
  managerCount: number;
  currentPeriodEnd: string | null;
  status: string;
  paddleSubscriptionId: string | null;
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
