import { apiAxios } from '@/lib/apiAxios';
import { AllowedIp, CreateAllowedIpPayload, UpdateAllowedIpPayload } from '@/types/allowed-ip';

export const fetchAllowedIps = (workspacePublicId: string) =>
    apiAxios.get<AllowedIp[]>(`/workspaces/${workspacePublicId}/allowed-ips`).then((r) => r.data);

export const createAllowedIp = ({
    workspacePublicId,
    data,
}: {
    workspacePublicId: string;
    data: CreateAllowedIpPayload;
}) => apiAxios.post<AllowedIp>(`/workspaces/${workspacePublicId}/allowed-ips`, data).then((r) => r.data);

export const updateAllowedIp = ({
    workspacePublicId,
    ipPublicId,
    data,
}: {
    workspacePublicId: string;
    ipPublicId: string;
    data: UpdateAllowedIpPayload;
}) => apiAxios.put<AllowedIp>(`/workspaces/${workspacePublicId}/allowed-ips/${ipPublicId}`, data).then((r) => r.data);

export const deleteAllowedIp = ({ workspacePublicId, ipPublicId }: { workspacePublicId: string; ipPublicId: string }) =>
    apiAxios.delete(`/workspaces/${workspacePublicId}/allowed-ips/${ipPublicId}`).then((r) => r.data);
