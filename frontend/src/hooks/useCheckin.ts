"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiV1Axios } from "@/lib/api";
import { getDeviceId, getDeviceName } from "@/lib/device";

export interface CheckinStatus {
  employeeName: string;
  shiftName: string | null;
  shiftStart: string | null;
  shiftEnd: string | null;
  today: {
    checkedIn: boolean;
    checkedOut: boolean;
    checkInAt: string | null;
    checkOutAt: string | null;
    isLate: boolean;
  };
}

export interface CheckinResponse {
  checkInAt: string | null;
  checkOutAt: string | null;
  isLate: boolean;
  leftEarly: boolean;
}

// Check-in endpoints are NOT locale-scoped, so use the bare /api/v1 client.
export function useCheckinStatus(qrToken: string) {
  return useQuery({
    queryKey: ["checkin", qrToken],
    queryFn: async () => {
      const { data } = await apiV1Axios.get<CheckinStatus>(`/checkin/${qrToken}`);
      return data;
    },
    enabled: !!qrToken,
    retry: false,
  });
}

export function useCheckinAction(qrToken: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (coords?: { latitude: number; longitude: number }) => {
      const { data } = await apiV1Axios.post<CheckinResponse>(`/checkin/${qrToken}`, {
        ...coords,
        deviceId: getDeviceId(),
        deviceName: getDeviceName(),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkin", qrToken] });
    },
  });
}
