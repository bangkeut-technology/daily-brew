import { apiAxios } from '@/lib/apiAxios';
import { PartialUser, PartialUserWithoutPassword, User } from '@/types/User';
import { formatISO } from 'date-fns';
import { Store } from '@/types/Store';

export const fetchUsers = () => apiAxios.get<User[]>('/users').then((response) => response.data);

export const fetchCurrentUser = () => apiAxios.get<User>('/users/me').then((response) => response.data);

export const fetchUser = (username: string) =>
    apiAxios.get<User>(`/users/${username}`).then((response) => response.data);

export const createUser = async ({ data, imageFile }: { data: PartialUser; imageFile: File }) => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('plainPassword', data.password);
    formData.append('roles[]', data.role);
    if (data.dob) {
        formData.append('dob', formatISO(data.dob));
    }
    formData.append('imageFile', imageFile);
    const response = await apiAxios.post<{ message: string; user: User }>('/users', formData);
    return response.data;
};
export const updateUser = ({ username, data }: { username: string; data: PartialUserWithoutPassword }) =>
    apiAxios.put<{ message: string; user: User }>(`/users/${username}`, data).then((response) => response.data);

export const deleteUser = (username: string) =>
    apiAxios.delete<{ message: string; user: User }>(`/users/${username}`).then((response) => response.data);

export const patchUser = ({ username, data }: { username: string; data?: { [_: string]: any } }) =>
    apiAxios.patch<{ message: string; user: User }>(`/users/${username}`, data).then((response) => response.data);

export const uploadUserImage = async ({ username, imageFile }: { username: string; imageFile: File }) => {
    const formData = new FormData();
    formData.append('imageFile', imageFile);
    const response = await apiAxios.post<{ message: string; user: User }>(`/users/${username}/uploads`, formData);
    return response.data;
};

export const userChangePassword = ({
    username,
    data,
}: {
    username: string;
    data: { plainPassword: { first: string; second: string } };
}) =>
    apiAxios
        .put<{ message: string; user: User }>(`/users/${username}/change-password`, data)
        .then((response) => response.data);

export const fetchMeStores = () => apiAxios.get<Store[]>(`/users/me/stores`).then((response) => response.data);
