import { apiAxios } from '@/lib/apiAxios';
import { Employee, PartialEmployee } from '@/types/employee';

export const fetchEmployees = async () => {
    return apiAxios.get<Employee[]>('/employees').then((response) => response.data);
};

export const fetchEmployee = async (identifier: string) => {
    return apiAxios.get<Employee>(`/employees/${identifier}`).then((response) => response.data);
};

export const postEmployee = async ({ roles = [], template, ...data }: PartialEmployee) => {
    return apiAxios
        .post<{
            employee: Employee;
            message: string;
        }>('/employees', { ...data, roles: roles.map((role) => role.value), templates: template ? [template] : [] })
        .then((response) => response.data);
};
