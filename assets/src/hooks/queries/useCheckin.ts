import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { CheckinStatus, CheckinResponse } from '@/types';
import { getDeviceId, getDeviceName } from '@/lib/device';

const checkinApi = axios.create({ baseURL: '/api/v1' });

export function useCheckinStatus(publicId: string) {
  return useQuery({
    queryKey: ['checkin', publicId],
    queryFn: async () => {
      const { data } = await checkinApi.get<CheckinStatus>(`/checkin/${publicId}`);
      return data;
    },
    enabled: !!publicId,
  });
}

export function useCheckinAction(publicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (coords?: { latitude: number; longitude: number }) => {
      const { data } = await checkinApi.post<CheckinResponse>(
        `/checkin/${publicId}`,
        {
          ...coords,
          deviceId: getDeviceId(),
          deviceName: getDeviceName(),
        },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkin', publicId] });
    },
  });
}
