import { date, object, ObjectSchema, string } from 'yup';
import { PartialAttendance } from '@/types/attendance';
import i18next from '@/i18next';

export const attendanceSchema: ObjectSchema<PartialAttendance> = object({
    employee: string().required(i18next.t('validation:required.attendances.employee')),
    attendanceDate: date().required(i18next.t('validation:required.attendances.date')),
    note: string().optional(),
    type: string()
        .oneOf(['present', 'absent', 'leave', 'late'], i18next.t('validation:one_of.attendances.type'))
        .required(i18next.t('validation:required.attendances.type')),
    clockIn: date().optional(),
    clockOut: date().optional(),
});
