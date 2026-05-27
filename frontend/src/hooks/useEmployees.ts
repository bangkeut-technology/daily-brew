"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiAxios } from "@/lib/api";
import type { Employee, EmployeeAttendanceTracking, EmployeeRole } from "@/types/employee";

export interface EmployeeInput {
  firstName: string;
  lastName: string;
  username?: string | null;
  phoneNumber?: string | null;
  jobTitle?: string | null;
  attendanceTracking?: EmployeeAttendanceTracking;
  role?: EmployeeRole;
}

export function useEmployees(workspacePublicId: string) {
  return useQuery({
    queryKey: ["employees", workspacePublicId],
    queryFn: async () => {
      const { data } = await apiAxios.get<Employee[]>(
        `/workspaces/${workspacePublicId}/employees`,
      );
      return data;
    },
    enabled: !!workspacePublicId,
  });
}

export function useCreateEmployee(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: EmployeeInput) => {
      const { data } = await apiAxios.post<Employee>(
        `/workspaces/${workspacePublicId}/employees`,
        input,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees", workspacePublicId] });
    },
  });
}

export function useUpdateEmployee(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ publicId, ...input }: EmployeeInput & { publicId: string }) => {
      const { data } = await apiAxios.put<Employee>(
        `/workspaces/${workspacePublicId}/employees/${publicId}`,
        input,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees", workspacePublicId] });
    },
  });
}

export function useDeleteEmployee(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (publicId: string) => {
      await apiAxios.delete(`/workspaces/${workspacePublicId}/employees/${publicId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees", workspacePublicId] });
    },
  });
}
