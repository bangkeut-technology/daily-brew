import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiAxios } from '@/lib/apiAxios';
import type { LeaveRequest } from '@/types';

export function useLeaveRequests(workspacePublicId: string, status?: string) {
  return useQuery({
    queryKey: ['leaveRequests', workspacePublicId, status],
    queryFn: async () => {
      const { data } = await apiAxios.get<LeaveRequest[]>(
        `/workspaces/${workspacePublicId}/leave-requests`,
        { params: status ? { status } : undefined },
      );
      return data;
    },
    enabled: !!workspacePublicId,
  });
}

export function useCreateLeaveRequest(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (leaveRequest: {
      employeePublicId: string;
      date: string;
      reason?: string;
    }) => {
      const { data } = await apiAxios.post<LeaveRequest>(
        `/workspaces/${workspacePublicId}/leave-requests`,
        leaveRequest,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests', workspacePublicId] });
    },
  });
}

export function useUpdateLeaveRequest(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ publicId, status }: { publicId: string; status: string }) => {
      const { data } = await apiAxios.put<LeaveRequest>(
        `/workspaces/${workspacePublicId}/leave-requests/${publicId}`,
        { status },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests', workspacePublicId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', workspacePublicId] });
    },
  });
}
