import { date, number, object, ObjectSchema, string } from 'yup';
import { PartialCoupon } from '@/types/Coupon';
import i18next from '@/i18next';

export const couponSchema: ObjectSchema<PartialCoupon> = object({
    title: string().required(i18next.t('validation:required.coupon.title')),
    code: string().required(i18next.t('validation:required.coupon.code')),
    type: string().required(i18next.t('validation:required.coupon.type')),
    discountValue: string().required(),
    discountType: string().required(),
    startDate: date(),
    endDate: date(),
    usageLimit: string().required(),
    minOrderValue: string(),
    product: number(),
});
