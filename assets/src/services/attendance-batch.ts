import { AttendanceBatch, PartialAttendanceBatch } from '@/types/attendance-batch';
import { apiAxios } from '@/lib/apiAxios';

export const postAttendanceBatch = async ({ employees, ...data }: PartialAttendanceBatch) =>
    apiAxios
        .post<{
            message: string;
            batch: AttendanceBatch;
        }>('/attendance-batches', { ...data, employees: employees?.map((employee) => employee.value) })
        .then((response) => response.data);
