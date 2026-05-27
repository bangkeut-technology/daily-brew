"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiAxios } from "@/lib/api";
import type { LeaveRequest, LeaveStatus } from "@/types/leave";

export function useLeaveRequests(workspacePublicId: string) {
  return useQuery({
    queryKey: ["leaveRequests", workspacePublicId],
    queryFn: async () => {
      const { data } = await apiAxios.get<LeaveRequest[]>(
        `/workspaces/${workspacePublicId}/leave-requests`,
      );
      return data;
    },
    enabled: !!workspacePublicId,
  });
}

export function useReviewLeaveRequest(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ publicId, status }: { publicId: string; status: LeaveStatus }) => {
      const { data } = await apiAxios.put<LeaveRequest>(
        `/workspaces/${workspacePublicId}/leave-requests/${publicId}`,
        { status },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveRequests", workspacePublicId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", workspacePublicId] });
    },
  });
}

export function useDeleteLeaveRequest(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (publicId: string) => {
      await apiAxios.delete(`/workspaces/${workspacePublicId}/leave-requests/${publicId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveRequests", workspacePublicId] });
    },
  });
}
