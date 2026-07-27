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
  manager: { publicId: string; name: string } | null;
  assignedEmployees: { publicId: string; name: string }[];
  /**
   * Each `inherit*` flag means "same as workspace" — when true the sibling
   * override fields are ignored entirely at check-in time.
   */
  inheritIpSettings: boolean;
  ipRestrictionEnabled: boolean;
  allowedIps: string[] | null;
  inheritGeofencing: boolean;
  geofencingEnabled: boolean;
  geofencingLatitude: number | null;
  geofencingLongitude: number | null;
  geofencingRadiusMeters: number | null;
  inheritDeviceVerification: boolean;
  deviceVerificationEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceQrCodeInput {
  name?: string;
  managerPublicId?: string | null;
  assignedEmployeePublicIds?: string[];
  inheritIpSettings?: boolean;
  ipRestrictionEnabled?: boolean;
  allowedIps?: string[] | null;
  inheritGeofencing?: boolean;
  geofencingEnabled?: boolean;
  geofencingLatitude?: number | null;
  geofencingLongitude?: number | null;
  geofencingRadiusMeters?: number | null;
  inheritDeviceVerification?: boolean;
  deviceVerificationEnabled?: boolean;
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

export function useWorkspaceQrCode(workspacePublicId: string, publicId: string) {
  return useQuery({
    queryKey: ["workspace-qr-codes", workspacePublicId, publicId],
    queryFn: async () =>
      (
        await apiAxios.get<WorkspaceQrCode>(
          `/workspaces/${workspacePublicId}/qr-codes/${publicId}`,
        )
      ).data,
    enabled: !!workspacePublicId && !!publicId,
  });
}

export function useCreateWorkspaceQrCode(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: WorkspaceQrCodeInput) =>
      (await apiAxios.post<WorkspaceQrCode>(`/workspaces/${workspacePublicId}/qr-codes`, input))
        .data,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["workspace-qr-codes", workspacePublicId] }),
  });
}

export function useUpdateWorkspaceQrCode(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ publicId, ...input }: WorkspaceQrCodeInput & { publicId: string }) =>
      (
        await apiAxios.patch<WorkspaceQrCode>(
          `/workspaces/${workspacePublicId}/qr-codes/${publicId}`,
          input,
        )
      ).data,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workspace-qr-codes", workspacePublicId] });
      queryClient.invalidateQueries({
        queryKey: ["workspace-qr-codes", workspacePublicId, variables.publicId],
      });
    },
  });
}

export function useDeleteWorkspaceQrCode(workspacePublicId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (publicId: string) => {
      await apiAxios.delete(`/workspaces/${workspacePublicId}/qr-codes/${publicId}`);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["workspace-qr-codes", workspacePublicId] }),
  });
}
