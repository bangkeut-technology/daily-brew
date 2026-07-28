"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiAxios } from "@/lib/api";
import type { LeaveRequest, LeaveStatus } from "@/types/leave";

/**
 * The API already scopes the list: an employee without `manage_leave` only
 * ever receives their own requests, so the page's client-side filter is a
 * display concern rather than the access control.
 */
export function useLeaveRequests(workspacePublicId: string, status?: string) {
  return useQuery({
    queryKey: ["leaveRequests", workspacePublicId, status ?? "all"],
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

export interface LeaveRequestInput {
  employeePublicId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  startTime?: string;
  endTime?: string;
}

export function useCreateLeaveRequest(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: LeaveRequestInput) =>
      (await apiAxios.post<LeaveRequest>(`/workspaces/${workspacePublicId}/leave-requests`, input))
        .data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leaveRequests", workspacePublicId] }),
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

/**
 * Owner/manager edit of an existing request's dates or reason. Distinct from
 * review (approve/reject) — this rewrites the request itself, which is how a
 * manager fixes a typo'd date without making the employee resubmit.
 */
export function useEditLeaveRequest(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      publicId,
      ...payload
    }: {
      publicId: string;
      startDate: string;
      endDate: string;
      reason?: string;
      startTime?: string;
      endTime?: string;
    }) =>
      (
        await apiAxios.put<LeaveRequest>(
          `/workspaces/${workspacePublicId}/leave-requests/${publicId}`,
          payload,
        )
      ).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaveRequests", workspacePublicId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
