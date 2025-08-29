import { apiAxios } from '@/lib/apiAxios';
import { Attendance, AttendanceStatus, PartialAttendance } from '@/types/attendance';

export type AttendanceSearchParams = {
    from: string | undefined;
    to: string | undefined;
    employee: string | undefined;
    status: AttendanceStatus | undefined;
};

export const fetchAttendances = async (params: AttendanceSearchParams) =>
    apiAxios.get<Attendance[]>('/attendances', { params }).then((response) => response.data);

export const postAttendance = async (attendance: PartialAttendance) =>
    apiAxios
        .post<{
            message: string;
            attendance: Attendance;
        }>('/attendances', attendance)
        .then((response) => response.data);

export const getAttendance = async (publicId: string) =>
    apiAxios.get<Attendance>(`/attendances/${publicId}`).then((response) => response.data);

export const putAttendance = async ({ publicId, attendance }: { publicId: string; attendance: PartialAttendance }) =>
    apiAxios
        .put<{ message: string; attendance: Attendance }>(`/attendances/${publicId}`, attendance)
        .then((response) => response.data);

export const deleteAttendance = async (publicId: string) =>
    apiAxios.delete<{ message: string }>(`/attendances/${publicId}`).then((response) => response.data);
