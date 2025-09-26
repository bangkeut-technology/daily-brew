import { AttendanceBatch, AttendanceBatchSearchParams, PartialAttendanceBatch } from '@/types/attendance-batch';
import { apiAxios } from '@/lib/apiAxios';

export const fetchAttendanceBatches = async (params: AttendanceBatchSearchParams) =>
    apiAxios.get<AttendanceBatch[]>('/attendance-batches', { params }).then((response) => response.data);

export const postAttendanceBatch = async ({ employees, ...data }: PartialAttendanceBatch) =>
    apiAxios
        .post<{
            message: string;
            batch: AttendanceBatch;
        }>('/attendance-batches', { ...data, employees: employees?.map((employee) => employee.value) })
        .then((response) => response.data);
