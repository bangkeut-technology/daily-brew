import { object, ObjectSchema, string } from 'yup';
import i18next from '@/i18next';
import { PartialZone } from '@/types/Zone';

export const zoneSchema: ObjectSchema<PartialZone> = object({
    name: string().required(i18next.t('validation:required.zone.name')),
});
