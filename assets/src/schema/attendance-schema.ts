import { date, object, ObjectSchema, string } from 'yup';
import { PartialAttendance } from '@/types/attendance';
import i18next from '@/i18next';

export const attendanceSchema: ObjectSchema<PartialAttendance> = object({
    attendanceDate: date().required(i18next.t('validation:required.attendances.date')),
    note: string().optional(),
    status: string()
        .oneOf(['present', 'absent', 'leave', 'late'], i18next.t('validation:one_of.attendances.status'))
        .required(i18next.t('validation:required.attendances.status')),
    clockIn: date().optional(),
    clockOut: date().optional(),
});
