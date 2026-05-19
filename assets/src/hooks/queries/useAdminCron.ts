import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiAxios } from '@/lib/apiAxios';
import type {
  CronJobOption,
  CronLastRun,
  CronRunResult,
  CronScheduleInput,
  ScheduledCommand,
} from '@/types/admin-cron';

export function useAdminCronJobs() {
  return useQuery({
    queryKey: ['admin-cron-jobs'],
    queryFn: async () => {
      const { data } = await apiAxios.get<CronJobOption[]>('/admin/cron/jobs');
      return data;
    },
    staleTime: 5 * 60_000,
  });
}

export function useAdminCronSchedules() {
  return useQuery({
    queryKey: ['admin-cron-schedules'],
    queryFn: async () => {
      const { data } = await apiAxios.get<ScheduledCommand[]>('/admin/cron/schedules');
      return data;
    },
    refetchInterval: 15_000,
  });
}

export function useCreateAdminCronSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CronScheduleInput) => {
      const { data } = await apiAxios.post<ScheduledCommand>('/admin/cron/schedules', input);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-cron-schedules'] }),
  });
}

export function useUpdateAdminCronSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CronScheduleInput }) => {
      const { data: row } = await apiAxios.patch<ScheduledCommand>(`/admin/cron/schedules/${id}`, data);
      return row;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-cron-schedules'] }),
  });
}

export function useDeleteAdminCronSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiAxios.delete(`/admin/cron/schedules/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-cron-schedules'] }),
  });
}

export function useRunAdminCronSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiAxios.post<CronRunResult>(`/admin/cron/schedules/${id}/run`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-cron-schedules'] }),
  });
}

export function useAdminCronRuns(command: string | null) {
  return useQuery({
    queryKey: ['admin-cron-runs', command],
    queryFn: async () => {
      const { data } = await apiAxios.get<CronLastRun[]>('/admin/cron/runs', {
        params: { command },
      });
      return data;
    },
    enabled: command !== null && command !== '',
  });
}
