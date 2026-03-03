import { apiAxios } from '@/lib/apiAxios';
import { Workspace, WorkspaceInvite, WorkspaceUser } from '@/types/workspace';

export const createWorkspace = (data: { name: string }) =>
    apiAxios.post<Workspace>('/workspaces', data).then((response) => response.data);

export const fetchMembers = (workspacePublicId: string) =>
    apiAxios.get<WorkspaceUser[]>(`/workspaces/${workspacePublicId}/members`).then((response) => response.data);

export const fetchInvites = (workspacePublicId: string) =>
    apiAxios.get<WorkspaceInvite[]>(`/workspaces/${workspacePublicId}/invites`).then((response) => response.data);

export const createInvite = (
    workspacePublicId: string,
    data: { email?: string; role: string; employeePublicId?: string },
) =>
    apiAxios
        .post<{
            publicId: string;
            status: string;
            expiresAt: string | null;
            token: string;
        }>(`/workspaces/${workspacePublicId}/invites`, data)
        .then((response) => response.data);

export const revokeInvite = ({
    workspacePublicId,
    invitePublicId,
}: {
    workspacePublicId: string;
    invitePublicId: string;
}) =>
    apiAxios
        .delete<{ message: string }>(`/workspaces/${workspacePublicId}/invites/${invitePublicId}`)
        .then((response) => response.data);
