import { apiAxios } from '@/lib/apiAxios';
import { Role } from '@/types/role';

export const fetchRoles = async () => {
    return apiAxios.get<Role[]>('/roles').then((response) => response.data);
};
