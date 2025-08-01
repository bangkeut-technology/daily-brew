import { apiAxios } from '@/lib/apiAxios';
import { Employee, PartialEmployee } from '@/types/employee';
import { EmployeeEvaluation } from '@/types/employee-evaluation';
import { formatISO } from 'date-fns';
import { Attendance, PartialAttendance } from '@/types/attendance';

export const fetchEmployees = async ({ from, to }: { from: string; to: string }) =>
    apiAxios
        .get<Employee[]>(`/employees`, {
            params: {
                from,
                to,
            },
        })
        .then((response) => response.data);

export const fetchEmployee = async ({ publicId, from, to }: { publicId: string; from: string; to: string }) =>
    apiAxios
        .get<Employee>(`/employees/${publicId}`, {
            params: {
                from,
                to,
            },
        })
        .then((response) => response.data);

export const postEmployee = async ({ roles = [], template, ...data }: PartialEmployee) =>
    apiAxios
        .post<{
            employee: Employee;
            message: string;
        }>('/employees', { ...data, roles: roles.map((role) => role.value), templates: template ? [template] : [] })
        .then((response) => response.data);

export const putEmployee = async ({ publicId, data }: { publicId: string; data: PartialEmployee }) =>
    apiAxios
        .put<{
            message: string;
            employee: Employee;
        }>(`/employees/${publicId}`, { ...data, roles: data.roles?.map((role) => role.value) || [] })
        .then((response) => response.data);

export const fetchEmployeeEvaluation = async ({ publicId, date = new Date() }: { publicId: string; date: Date }) =>
    apiAxios
        .get<EmployeeEvaluation | null>(`/employees/${publicId}/evaluation`, {
            params: { date: formatISO(date) },
        })
        .then((response) => response.data);

export const fetchAttendances = async ({ publicId, from, to }: { publicId: string; from: string; to: string }) =>
    apiAxios
        .get<Attendance[]>(`/employees/${publicId}/attendance`, { params: { from, to } })
        .then((response) => response.data);

export const postAttendance = async ({ publicId, data }: { publicId: string; data: PartialAttendance }) =>
    apiAxios
        .post<{ message: string; attendance: Attendance }>(`/employees/${publicId}/attendance`, data)
        .then((response) => response.data);
