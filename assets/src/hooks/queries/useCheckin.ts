import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { CheckinStatus, CheckinResponse } from '@/types';

const checkinApi = axios.create({ baseURL: '/api/v1' });

export function useCheckinStatus(qrToken: string) {
  return useQuery({
    queryKey: ['checkin', qrToken],
    queryFn: async () => {
      const { data } = await checkinApi.get<CheckinStatus>(`/checkin/${qrToken}`);
      return data;
    },
    enabled: !!qrToken,
  });
}

export function useCheckinAction(qrToken: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (coords?: { latitude: number; longitude: number }) => {
      const { data } = await checkinApi.post<CheckinResponse>(
        `/checkin/${qrToken}`,
        coords ?? {},
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkin', qrToken] });
    },
  });
}
