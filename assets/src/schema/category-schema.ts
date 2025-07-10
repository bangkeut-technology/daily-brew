import { PartialCategory } from '@/types/Category';
import { object, ObjectSchema, string } from 'yup';
import i18next from '@/i18next';

export const categorySchema: ObjectSchema<PartialCategory> = object({
    name: string().required(i18next.t('validation:required.category.name')),
    description: string(),
    color: string(),
});
