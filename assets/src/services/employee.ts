import { apiAxios } from '@/lib/apiAxios';
import { Employee, PartialEmployee } from '@/types/employee';
import { EmployeeEvaluation } from '@/types/employee-evaluation';
import { formatISO } from 'date-fns';

export const fetchEmployees = async ({ from, to }: { from: string; to: string }) => {
    return apiAxios
        .get<Employee[]>(`/employees`, {
            params: {
                from,
                to,
            },
        })
        .then((response) => response.data);
};

export const fetchEmployee = async ({ publicId, from, to }: { publicId: string; from: string; to: string }) => {
    return apiAxios
        .get<Employee>(`/employees/${publicId}`, {
            params: {
                from,
                to,
            },
        })
        .then((response) => response.data);
};

export const postEmployee = async ({ roles = [], template, ...data }: PartialEmployee) => {
    return apiAxios
        .post<{
            employee: Employee;
            message: string;
        }>('/employees', { ...data, roles: roles.map((role) => role.value), templates: template ? [template] : [] })
        .then((response) => response.data);
};

export const fetchEmployeeEvaluation = async ({ publicId, date = new Date() }: { publicId: string; date: Date }) => {
    return apiAxios
        .get<EmployeeEvaluation | null>(`/employees/${publicId}/evaluation`, {
            params: { date: formatISO(date) },
        })
        .then((response) => response.data);
};
