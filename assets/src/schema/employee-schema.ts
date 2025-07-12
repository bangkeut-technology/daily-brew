import { array, date, number, object, ObjectSchema, string } from 'yup';
import { PartialEmployee } from '@/types/employee';
import i18next from '@/i18next';

export const employeeSchema: ObjectSchema<PartialEmployee> = object({
    firstName: string().required(i18next.t('validation:required.first_name')),
    lastName: string().required(i18next.t('validation:required.last_name')),
    phoneNumber: string().optional(),
    dob: date().optional(),
    joinedAt: date().optional(),
    roles: array().of(
        object().shape({
            value: number().required(i18next.t('validation:required.role_id')),
        }),
    ),
});
