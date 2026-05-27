"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiAxios } from "@/lib/api";

export interface WorkspaceDetail {
  publicId: string;
  name: string;
  qrToken: string;
}

export interface WorkspaceQrCode {
  publicId: string;
  qrToken: string;
  name: string;
}

export function useWorkspaceDetail(publicId: string) {
  return useQuery({
    queryKey: ["workspaces", publicId],
    queryFn: async () => {
      const { data } = await apiAxios.get<WorkspaceDetail>(`/workspaces/${publicId}`);
      return data;
    },
    enabled: !!publicId,
  });
}

export function useRegenerateWorkspaceToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (publicId: string) => {
      const { data } = await apiAxios.post<{ publicId: string; qrToken: string }>(
        `/workspaces/${publicId}/regenerate-qr-token`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}

export function useWorkspaceQrCodes(workspacePublicId: string) {
  return useQuery({
    queryKey: ["workspace-qr-codes", workspacePublicId],
    queryFn: async () => {
      const { data } = await apiAxios.get<WorkspaceQrCode[]>(
        `/workspaces/${workspacePublicId}/qr-codes`,
      );
      return data;
    },
    enabled: !!workspacePublicId,
  });
}
