"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiAxios } from "@/lib/api";
import type {
  CronJobOption,
  CronLastRun,
  CronRunResult,
  CronScheduleInput,
  ScheduledCommand,
} from "@/types/admin-cron";

const KEY = ["admin", "cron", "schedules"];

export function useAdminCronSchedules() {
  return useQuery({
    queryKey: KEY,
    queryFn: async () => (await apiAxios.get<ScheduledCommand[]>("/admin/cron/schedules")).data,
    // The master cron fires every minute; polling keeps last-run status and
    // the next-run countdown honest without the admin reloading the page.
    refetchInterval: 15_000,
  });
}

/** Run history for one command, loaded on demand by the history sheet. */
export function useAdminCronRuns(command: string | null) {
  return useQuery({
    queryKey: ["admin", "cron", "runs", command],
    queryFn: async () =>
      (await apiAxios.get<CronLastRun[]>("/admin/cron/runs", { params: { command } })).data,
    enabled: !!command,
  });
}

export function useAdminCronJobs() {
  return useQuery({
    queryKey: ["admin", "cron", "jobs"],
    queryFn: async () => (await apiAxios.get<CronJobOption[]>("/admin/cron/jobs")).data,
  });
}

export function useCreateAdminCronSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CronScheduleInput) =>
      (await apiAxios.post<ScheduledCommand>("/admin/cron/schedules", input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateAdminCronSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: CronScheduleInput & { id: number }) =>
      (await apiAxios.patch<ScheduledCommand>(`/admin/cron/schedules/${id}`, data)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteAdminCronSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await apiAxios.delete(`/admin/cron/schedules/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useRunAdminCronSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) =>
      (await apiAxios.post<CronRunResult>(`/admin/cron/schedules/${id}/run`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}
