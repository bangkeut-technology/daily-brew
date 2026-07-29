"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiAxios } from "@/lib/api";
import type { Employee, EmployeeAttendanceTracking, EmployeeRole } from "@/types/employee";
import type { ManagerPermission } from "@/types/auth";

export interface EmployeeInput {
  firstName: string;
  lastName: string;
  username?: string | null;
  phoneNumber?: string | null;
  jobTitle?: string | null;
  attendanceTracking?: EmployeeAttendanceTracking;
  role?: EmployeeRole;
  dob?: string | null;
  joinedAt?: string | null;
  shiftPublicId?: string | null;
  /**
   * Links the employee to a user account at creation time. The backend links
   * before it reads `role`, which is why a manager can only be created when
   * this is supplied — the create form doesn't offer the role at all.
   */
  linkedUserPublicId?: string | null;
}

/**
 * The detail page can additionally flip status and move the absent-baseline
 * anchor — neither of which the create form exposes. `null` on
 * `linkedUserPublicId` unlinks.
 */
export interface EmployeeUpdateInput extends Partial<EmployeeInput> {
  active?: boolean;
  linkedAt?: string | null;
  leftAt?: string | null;
}

export function useEmployee(workspacePublicId: string, publicId: string) {
  return useQuery({
    queryKey: ["employees", workspacePublicId, publicId],
    queryFn: async () =>
      (await apiAxios.get<Employee>(`/workspaces/${workspacePublicId}/employees/${publicId}`)).data,
    enabled: !!workspacePublicId && !!publicId,
  });
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
    mutationFn: async ({ publicId, ...input }: EmployeeUpdateInput & { publicId: string }) => {
      const { data } = await apiAxios.put<Employee>(
        `/workspaces/${workspacePublicId}/employees/${publicId}`,
        input,
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employees", workspacePublicId] });
      queryClient.invalidateQueries({
        queryKey: ["employees", workspacePublicId, variables.publicId],
      });
    },
  });
}

export function useUpdateManagerPermissions(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ publicId, permissions }: { publicId: string; permissions: ManagerPermission[] }) =>
      (
        await apiAxios.patch<Employee>(
          `/workspaces/${workspacePublicId}/employees/${publicId}/manager-permissions`,
          { permissions },
        )
      ).data,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employees", workspacePublicId] });
      queryClient.invalidateQueries({
        queryKey: ["employees", workspacePublicId, variables.publicId],
      });
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
