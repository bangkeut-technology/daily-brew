import { apiAxios } from '@/lib/apiAxios';
import { Attendance, AttendanceSearchParams, AttendanceTypeEnum, PartialAttendance } from '@/types/attendance';
import { Employee, EmployeeAttendance } from '@/types/employee';
import { format } from 'date-fns';
import { DATE_FORMAT } from '@/constants/date';

export const fetchAttendances = async ({ employees, ...params }: AttendanceSearchParams) =>
    apiAxios
        .get<
            Attendance[]
        >('/attendances', { params: { ...params, employees: employees?.map((employee) => employee.publicId) } })
        .then((response) => response.data);

export const postAttendance = async ({ attendanceDate, ...attendance }: PartialAttendance) =>
    apiAxios
        .post<{
            message: string;
            attendance: Attendance;
        }>('/attendances', { ...attendance, attendanceDate: format(attendanceDate, DATE_FORMAT) })
        .then((response) => response.data);

export const fetchUpcomingAttendances = async (type: AttendanceTypeEnum) =>
    apiAxios.get<Attendance[]>('/attendances/upcoming', { params: { type } }).then((response) => response.data);

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
