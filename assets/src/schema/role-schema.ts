import { object, ObjectSchema, string } from 'yup';
import { PartialRole } from '@/types/role';
import i18next from '@/i18next';

export const roleSchema: ObjectSchema<PartialRole> = object({
    name: string().required(i18next.t('validation:required.roles.name')),
    description: string().optional(),
});
