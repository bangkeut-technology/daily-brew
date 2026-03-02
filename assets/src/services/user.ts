import { apiAxios, axios } from '@/lib/apiAxios';
import { ChangePassword, UpdateUser, User } from '@/types/user';
import { Workspace } from '@/types/workspace';
import { ProviderKey } from '@/types/oauth';

export const fetchCurrentUser = () => apiAxios.get<User>('/users/me').then((response) => response.data);

export const updateUser = ({ data }: { data: UpdateUser }) =>
    apiAxios.put<{ message: string; user: User }>(`/users/me`, data).then((response) => response.data);

export const deleteUser = () =>
    apiAxios.delete<{ message: string; user: User }>(`/users/me`).then((response) => response.data);

export const patch = ({ data }: { data?: { [_: string]: any } }) =>
    apiAxios.patch<{ message: string; user: User }>(`/users/me`, data).then((response) => response.data);

export const uploadImage = async ({ imageFile }: { imageFile: File }) => {
    const formData = new FormData();
    formData.append('imageFile', imageFile);
    const response = await apiAxios.post<{ message: string; user: User }>(`/users/me/uploads`, formData);
    return response.data;
};

export const patchLocale = ({ locale }: { locale: string }) =>
    apiAxios.patch<{ message: string; user: User }>('/users/me/locale', { locale }).then((response) => response.data);

export const changePassword = (data: ChangePassword) =>
    apiAxios.put<{ message: string; user: User }>('/users/me/change-password', data).then((response) => response.data);

export const fetchCurrentWorkspace = () =>
    apiAxios.get<Workspace>('/users/me/current-workspace').then((response) => response.data);

export const fetchWorkspaces = () =>
    apiAxios.get<Workspace[]>('/users/me/workspaces').then((response) => response.data);

export const switchWorkspace = (workspacePublicId: string) =>
    apiAxios
        .patch<{ message: string; workspace: Workspace }>('/users/me/workspaces', { workspacePublicId })
        .then((response) => response.data);

export const disconnectOAuth = (provider: ProviderKey) =>
    apiAxios.delete<{ message: string; user: User }>(`/oauth/connect/${provider}`).then((response) => response.data);
