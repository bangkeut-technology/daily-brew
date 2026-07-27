"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios } from "@/lib/api";
import type { Employee } from "@/types/employee";

function photoUrl(workspacePublicId: string, employeePublicId: string): string {
  return `/workspaces/${workspacePublicId}/employees/${employeePublicId}/photo`;
}

/**
 * Multipart upload. Content-Type is forced to undefined so axios stops
 * applying the client's JSON default and lets the browser write the multipart
 * boundary itself.
 *
 * Invalidates both the roster query and the detail query so the headshot
 * updates in the list and on this page.
 */
export function useUploadEmployeePhoto(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ publicId, file }: { publicId: string; file: File }) => {
      const body = new FormData();
      body.append("file", file);
      const { data } = await apiAxios.post<Employee>(photoUrl(workspacePublicId, publicId), body, {
        headers: { "Content-Type": undefined } as never,
      });
      return data;
    },
    onSuccess: (_employee, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employees", workspacePublicId] });
      queryClient.invalidateQueries({
        queryKey: ["employees", workspacePublicId, variables.publicId],
      });
    },
  });
}

export function useRemoveEmployeePhoto(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (publicId: string) =>
      (await apiAxios.delete<Employee>(photoUrl(workspacePublicId, publicId))).data,
    onSuccess: (_employee, publicId) => {
      queryClient.invalidateQueries({ queryKey: ["employees", workspacePublicId] });
      queryClient.invalidateQueries({ queryKey: ["employees", workspacePublicId, publicId] });
    },
  });
}
