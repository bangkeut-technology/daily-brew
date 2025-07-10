import { object, ObjectSchema, string } from 'yup';
import { PartialPayment } from '@/types/Payment';
import i18next from '@/i18next';

export const paymentSchema: ObjectSchema<PartialPayment> = object({
    dueAmount: string().required(i18next.t('validation:required.payment.due_amount')),
    dueAmountInRiel: string().required(i18next.t('validation:required.payment.due_amount_in_riel')),
    paidAmount: string(),
    paidAmountInRiel: string(),
    paymentMethod: string().required(i18next.t('validation:required.payment.payment_method')),
    exchangeRate: string().required(i18next.t('validation:required.payment.exchange_rate')),
});
