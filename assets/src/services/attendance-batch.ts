import { AttendanceBatch, AttendanceBatchSearchParams, PartialAttendanceBatch } from '@/types/attendance-batch';
import { apiAxios } from '@/lib/apiAxios';
import { format } from 'date-fns';
import { DATE_FORMAT } from '@/constants/date';

export const fetchAttendanceBatches = async (params: AttendanceBatchSearchParams) =>
    apiAxios.get<AttendanceBatch[]>('/attendance-batches', { params }).then((response) => response.data);

export const postAttendanceBatch = async ({ employees, fromDate, toDate, ...data }: PartialAttendanceBatch) =>
    apiAxios
        .post<{
            message: string;
            batch: AttendanceBatch;
        }>('/attendance-batches', {
            ...data,
            fromDate: format(fromDate, DATE_FORMAT),
            toDate: format(toDate, DATE_FORMAT),
            employees: employees?.map((employee) => employee.value),
        })
        .then((response) => response.data);

export const fetchUpcomingAttendanceBatches = async () =>
    apiAxios.get<AttendanceBatch[]>('/attendance-batches/upcoming').then((response) => response.data);
