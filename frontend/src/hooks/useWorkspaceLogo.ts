"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAxios } from "@/lib/api";

interface LogoResponse {
  publicId: string;
  logoUrl: string | null;
}

function logoEndpoint(workspacePublicId: string): string {
  return `/workspaces/${workspacePublicId}/logo`;
}

/**
 * Both mutations invalidate the single-workspace query *and* the list: the
 * logo shows in the settings card and in the workspace switcher, and they read
 * from different cache entries.
 */
function invalidate(queryClient: ReturnType<typeof useQueryClient>, workspacePublicId: string) {
  queryClient.invalidateQueries({ queryKey: ["workspaces", workspacePublicId] });
  queryClient.invalidateQueries({ queryKey: ["workspaces"] });
}

/**
 * Multipart upload. Content-Type is forced to undefined so axios stops
 * applying the client's JSON default and lets the browser write the multipart
 * boundary itself.
 */
export function useUploadWorkspaceLogo(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const body = new FormData();
      body.append("file", file);
      const { data } = await apiAxios.post<LogoResponse>(logoEndpoint(workspacePublicId), body, {
        headers: { "Content-Type": undefined } as never,
      });
      return data;
    },
    onSuccess: () => invalidate(queryClient, workspacePublicId),
  });
}

export function useRemoveWorkspaceLogo(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () =>
      (await apiAxios.delete<LogoResponse>(logoEndpoint(workspacePublicId))).data,
    onSuccess: () => invalidate(queryClient, workspacePublicId),
  });
}
