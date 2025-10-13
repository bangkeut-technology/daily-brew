import { apiAxios } from '@/lib/apiAxios';
import { PartialRole, Role } from '@/types/role';

export const fetchRoles = async () => {
    return apiAxios.get<Role[]>('/roles').then((response) => response.data);
};

export const postRole = async (role: PartialRole) => {
    return apiAxios.post<{ message: string; role: Role }>('/roles', role).then((response) => response.data);
};

export const putRole = async ({ publicId, role }: { publicId: string; role: PartialRole }) => {
    return apiAxios.put<{ message: string; role: Role }>(`/roles/${publicId}`, role).then((response) => response.data);
};

export const deleteRole = async (publicId: string) => {
    return apiAxios.delete<{ message: string }>(`/roles/${publicId}`).then((response) => response.data);
};
