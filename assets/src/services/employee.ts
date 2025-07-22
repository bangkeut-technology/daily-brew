import { apiAxios } from '@/lib/apiAxios';
import { Employee, PartialEmployee } from '@/types/employee';
import { EmployeeEvaluation } from '@/types/employee-evaluation';
import { formatISO } from 'date-fns';

export const fetchEmployees = async ({ from, to }: { from: string; to: string }) => {
    const query = new URLSearchParams({ from, to });
    return apiAxios.get<Employee[]>(`/employees?${query}`).then((response) => response.data);
};

export const fetchEmployee = async ({ identifier, from, to }: { identifier: string; from: string; to: string }) => {
    const query = new URLSearchParams({ from, to });
    return apiAxios.get<Employee>(`/employees/${identifier}?${query}`).then((response) => response.data);
};

export const postEmployee = async ({ roles = [], template, ...data }: PartialEmployee) => {
    return apiAxios
        .post<{
            employee: Employee;
            message: string;
        }>('/employees', { ...data, roles: roles.map((role) => role.value), templates: template ? [template] : [] })
        .then((response) => response.data);
};

export const fetchEmployeeEvaluation = async ({
    identifier,
    date = new Date(),
}: {
    identifier: string;
    date: Date;
}) => {
    const query = new URLSearchParams({ date: formatISO(date) });
    return apiAxios
        .get<EmployeeEvaluation | null>(`/employees/${identifier}/evaluation?${query}`)
        .then((response) => response.data);
};
