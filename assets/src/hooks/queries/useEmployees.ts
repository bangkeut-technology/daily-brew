import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiAxios } from '@/lib/apiAxios';
import type { Employee } from '@/types';

export function useEmployees(workspacePublicId: string) {
  return useQuery({
    queryKey: ['employees', workspacePublicId],
    queryFn: async () => {
      const { data } = await apiAxios.get<Employee[]>(
        `/workspaces/${workspacePublicId}/employees`,
      );
      return data;
    },
    enabled: !!workspacePublicId,
  });
}

export function useEmployee(workspacePublicId: string, publicId: string) {
  return useQuery({
    queryKey: ['employees', workspacePublicId, publicId],
    queryFn: async () => {
      const { data } = await apiAxios.get<Employee>(
        `/workspaces/${workspacePublicId}/employees/${publicId}`,
      );
      return data;
    },
    enabled: !!workspacePublicId && !!publicId,
  });
}

export function useCreateEmployee(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (employee: {
      firstName: string;
      lastName: string;
      phoneNumber?: string;
      username?: string;
      shiftPublicId?: string;
      linkedUserPublicId?: string;
      dob?: string;
      joinedAt?: string;
    }) => {
      const { data } = await apiAxios.post<Employee>(
        `/workspaces/${workspacePublicId}/employees`,
        employee,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', workspacePublicId] });
    },
  });
}

export function useUpdateEmployee(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      publicId,
      ...employee
    }: {
      publicId: string;
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      username?: string | null;
      shiftPublicId?: string | null;
      active?: boolean;
      linkedUserPublicId?: string | null;
      dob?: string | null;
      joinedAt?: string | null;
    }) => {
      const { data } = await apiAxios.put<Employee>(
        `/workspaces/${workspacePublicId}/employees/${publicId}`,
        employee,
      );
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees', workspacePublicId] });
      queryClient.invalidateQueries({
        queryKey: ['employees', workspacePublicId, variables.publicId],
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
      queryClient.invalidateQueries({ queryKey: ['employees', workspacePublicId] });
    },
  });
}
