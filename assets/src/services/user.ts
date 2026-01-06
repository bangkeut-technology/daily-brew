import { apiAxios } from '@/lib/apiAxios';
import { PartialUserWithoutPassword, User } from '@/types/user';
import { Workspace } from '@/types/workspace';

export const fetchCurrentUser = () => apiAxios.get<User>('/users/me').then((response) => response.data);

export const updateUser = ({ data }: { data: PartialUserWithoutPassword }) =>
    apiAxios.put<{ message: string; user: User }>(`/users/me`, data).then((response) => response.data);

export const deleteUser = (password: string) =>
    apiAxios
        .delete<{ message: string; user: User }>(`/users/me`, { data: { password } })
        .then((response) => response.data);

export const patch = ({ data }: { data?: { [_: string]: any } }) =>
    apiAxios.patch<{ message: string; user: User }>(`/users/me`, data).then((response) => response.data);

export const uploadImage = async ({ imageFile }: { imageFile: File }) => {
    const formData = new FormData();
    formData.append('imageFile', imageFile);
    const response = await apiAxios.post<{ message: string; user: User }>(`/users/me/uploads`, formData);
    return response.data;
};

export const changePassword = ({
    data,
}: {
    publicId: string;
    data: { plainPassword: { first: string; second: string } };
}) =>
    apiAxios.put<{ message: string; user: User }>(`/users/me/change-password`, data).then((response) => response.data);

export const fetchCurrentWorkspace = () =>
    apiAxios.get<Workspace>('/users/me/current-workspace').then((response) => response.data);

export const fetchWorkspaces = () =>
    apiAxios.get<Workspace[]>('/users/me/workspaces').then((response) => response.data);
