import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiAxios } from '@/lib/apiAxios';
import type { Employee } from '@/types';

function photoUrl(workspacePublicId: string, employeePublicId: string): string {
  return `/workspaces/${workspacePublicId}/employees/${employeePublicId}/photo`;
}

/**
 * Multipart upload — see useUserAvatar for why Content-Type is forced to
 * undefined (so axios delegates to the browser's multipart boundary writer).
 *
 * Invalidates both the workspace roster query and the individual employee
 * detail query so the headshot updates in both views.
 */
export function useUploadEmployeePhoto(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ publicId, file }: { publicId: string; file: File }) => {
      const body = new FormData();
      body.append('file', file);
      const { data } = await apiAxios.post<Employee>(photoUrl(workspacePublicId, publicId), body, {
        headers: { 'Content-Type': undefined } as any,
      });
      return data;
    },
    onSuccess: (_employee, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees', workspacePublicId] });
      queryClient.invalidateQueries({ queryKey: ['employees', workspacePublicId, variables.publicId] });
    },
  });
}

export function useRemoveEmployeePhoto(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (publicId: string) => {
      const { data } = await apiAxios.delete<Employee>(photoUrl(workspacePublicId, publicId));
      return data;
    },
    onSuccess: (_employee, publicId) => {
      queryClient.invalidateQueries({ queryKey: ['employees', workspacePublicId] });
      queryClient.invalidateQueries({ queryKey: ['employees', workspacePublicId, publicId] });
    },
  });
}
