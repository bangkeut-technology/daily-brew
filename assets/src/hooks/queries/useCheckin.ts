import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axios } from '@/lib/apiAxios';
import type { CheckinStatus, CheckinResponse } from '@/types';
import { getDeviceId, getDeviceName } from '@/lib/device';

export function useCheckinStatus(workspaceQrToken: string) {
  return useQuery({
    queryKey: ['checkin', workspaceQrToken],
    queryFn: async () => {
      const { data } = await axios.get<CheckinStatus>(`/checkin/${workspaceQrToken}`);
      return data;
    },
    enabled: !!workspaceQrToken,
  });
}

export function useCheckinAction(workspaceQrToken: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (coords?: { latitude: number; longitude: number }) => {
      const { data } = await axios.post<CheckinResponse>(
        `/checkin/${workspaceQrToken}`,
        {
          ...coords,
          deviceId: getDeviceId(),
          deviceName: getDeviceName(),
        },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkin', workspaceQrToken] });
    },
  });
}
