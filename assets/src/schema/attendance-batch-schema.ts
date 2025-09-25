import { array, date, number, object, ObjectSchema, string } from 'yup';
import { AttendanceTypeEnum } from '@/types/attendance';
import i18next from '@/i18next';
import { PartialAttendanceBatch } from '@/types/attendance-batch';

export const attendanceBatchSchema: ObjectSchema<PartialAttendanceBatch> = object({
    label: string().required(i18next.t('validation:required.attendance_batches.label')),
    fromDate: date().required(i18next.t('validation:required.attendance_batches.from')),
    toDate: date().required(i18next.t('validation:required.attendance_batches.to')),
    note: string().optional(),
    type: string()
        .oneOf(Object.values(AttendanceTypeEnum), i18next.t('validation:one_of.attendance_batches.type'))
        .required(i18next.t('validation:required.attendance_batches.type')),
    employees: array().of(
        object({
            value: number().required(i18next.t('validation:required.employees.id')),
        }),
    ),
});
