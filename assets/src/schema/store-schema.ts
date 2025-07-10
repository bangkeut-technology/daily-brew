import { object, ObjectSchema, string } from 'yup';
import i18next from '@/i18next';
import { PartialStore } from '@/types/Store';

export const storeSchema: ObjectSchema<PartialStore> = object({
    name: string().required(i18next.t('validation:required.category.name')),
});
