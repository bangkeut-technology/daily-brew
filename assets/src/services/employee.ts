import { apiAxios } from '@/lib/apiAxios';
import { Employee, PartialEmployee } from '@/types/employee';

export const fetchEmployees = async () => {
    return apiAxios.get<Employee[]>('/employees').then((response) => response.data);
};

export const fetchEmployee = async (identifier: string) => {
    return apiAxios.get<Employee>(`/employees/${identifier}`).then((response) => response.data);
};

export const createEmployee = async (data: PartialEmployee) => {
    return apiAxios.post<Employee>('/employees', data).then((response) => response.data);
};
