import { apiAxios } from '@/lib/apiAxios';
import { PartialRole, Role } from '@/types/role';

export const fetchRoles = async () => {
    return apiAxios.get<Role[]>('/roles').then((response) => response.data);
};

export const postRole = async (role: PartialRole) => {
    return apiAxios.post<{ message: string; role: Role }>('/roles', role).then((response) => response.data);
};
