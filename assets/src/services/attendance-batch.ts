import { AttendanceBatch, PartialAttendanceBatch } from '@/types/attendance-batch';
import { apiAxios } from '@/lib/apiAxios';

export const postAttendanceBatch = async (data: PartialAttendanceBatch) =>
    apiAxios
        .post<{ message: string; batch: AttendanceBatch }>('/attendance-batches', data)
        .then((response) => response.data);
