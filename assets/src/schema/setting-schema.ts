import { object, ObjectSchema, string } from 'yup';
import { SettingType } from '@/types/setting';
import i18next from '@/i18next';

export const settingSchema: ObjectSchema<SettingType> = object({
    numberOfPaidLeave: string()
        .required(i18next.t('validation:required.settings.number_of_paid_leave'))
        .test('is-positive', i18next.t('validation:positive.settings.number_of_paid_leave'), (value) =>
            value ? parseFloat(value) >= 0 : false,
        ),
    maximumLateCount: string()
        .required(i18next.t('validation:required.settings.maximum_late_count'))
        .test('is-positive', i18next.t('validation:positive.settings.maximum_late_count'), (value) =>
            value ? parseFloat(value) >= 0 : false,
        ),
    paidLeaveCycle: string()
        .oneOf(['monthly', 'yearly'], i18next.t('validation:one_of.settings.paid_leave_cycle'))
        .required(i18next.t('validation:required.settings.paid_leave_cycle')),
});
