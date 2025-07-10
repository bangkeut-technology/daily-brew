import { boolean, object, ObjectSchema, string } from 'yup';
import { SubmitSetting } from '@/types/Setting';
import i18next from '@/i18next';

export const settingSchema: ObjectSchema<SubmitSetting> = object({
    vatRate: string()
        .required(i18next.t('validation:required.setting.vat_rate'))
        .test('is-percentage', i18next.t('validation:percentage.vat_rate'), (value) =>
            /^(100(\.0+)?|(\d{1,2})(\.\d+)?)$/.test(value),
        )
        .test('is-positive', i18next.t('validation:positive.setting.vat_rate'), (value) =>
            value ? parseFloat(value) >= 0 : false,
        ),
    exchangeRate: string()
        .required(i18next.t('validation:required.setting.exchange_rate'))
        .test('is-positive', i18next.t('validation:positive.setting.exchange_rate'), (value) =>
            value ? parseFloat(value) >= 0 : false,
        ),
    invoicePrefix: string().required(i18next.t('validation:required.setting.invoice_prefix')),
    invoiceSequenceLength: string()
        .required(i18next.t('validation:required.setting.invoice_sequence_length'))
        .test('is-positive', i18next.t('validation:positive.setting.invoice_sequence_length'), (value) =>
            value ? parseInt(value) > 0 : false,
        ),
    tableNumberMin: string()
        .required(i18next.t('validation:required.setting.table_number_min'))
        .test('is-positive', i18next.t('validation:positive.setting.table_number_min'), (value) =>
            value ? parseInt(value) > 0 : false,
        ),
    tableNumberMax: string()
        .required(i18next.t('validation:required.setting.table_number_max'))
        .test('is-positive', i18next.t('validation:positive.setting.table_number_max'), (value) =>
            value ? parseInt(value) > 0 : false,
        )
        .test('is-greater', i18next.t('validation:greater.setting.table_number_max'), function (value) {
            return parseInt(value) > parseInt(this.parent.tableNumberMin);
        }),
    autoDeviceApproval: boolean().required(i18next.t('validation:required.setting.auto_device_approval')),
});
