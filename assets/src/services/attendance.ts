import { apiAxios } from '@/lib/apiAxios';
import { Attendance, AttendanceStatus, AttendanceStatusEnum, PartialAttendance } from '@/types/attendance';
import { Employee, EmployeeAttendance } from '@/types/employee';

export type AttendanceSearchParams = {
    from: string | undefined;
    to: string | undefined;
    employee?: string;
    employees?: Employee[];
    status?: AttendanceStatus;
};

export const fetchAttendances = async ({ employees, ...params }: AttendanceSearchParams) =>
    apiAxios
        .get<
            Attendance[]
        >('/attendances', { params: { ...params, employees: employees?.map((employee) => employee.publicId) } })
        .then((response) => response.data);

export const postAttendance = async (attendance: PartialAttendance) =>
    apiAxios
        .post<{
            message: string;
            attendance: Attendance;
        }>('/attendances', attendance)
        .then((response) => response.data);

export const fetchUpcomingAttendances = async (status: AttendanceStatusEnum) =>
    apiAxios.get<Attendance[]>('/attendances/upcoming', { params: { status } }).then((response) => response.data);

export const fetchGanttAttendances = async ({
    employees,
    ...params
}: {
    from: string;
    to: string;
    employees: Employee[];
}) =>
    apiAxios
        .get<{
            [key: string]: EmployeeAttendance;
        }>('/attendances/gantt', { params: { ...params, employees: employees?.map((employee) => employee.publicId) } })
        .then((response) => response.data);

export const getAttendance = async (publicId: string) =>
    apiAxios.get<Attendance>(`/attendances/${publicId}`).then((response) => response.data);

export const putAttendance = async ({ publicId, attendance }: { publicId: string; attendance: PartialAttendance }) =>
    apiAxios
        .put<{ message: string; attendance: Attendance }>(`/attendances/${publicId}`, attendance)
        .then((response) => response.data);

export const deleteAttendance = async (publicId: string) =>
    apiAxios.delete<{ message: string }>(`/attendances/${publicId}`).then((response) => response.data);
