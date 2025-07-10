import { array, mixed, number, object, ObjectSchema, string } from 'yup';
import { PartialOrder } from '@/types/Order';
import { Product } from '@/types/Product';
import i18next from '@/i18next';

export const orderSchema: ObjectSchema<PartialOrder> = object({
    type: string()
        .oneOf(['dine_in', 'delivery', 'pickup', 'to_go'], i18next.t('validation:one_of.order.type'))
        .required(i18next.t('validation:required.order.type')),
    items: array(
        object({
            product: mixed<Product>().required(i18next.t('validation:required.order.product')),
            price: string()
                .required(i18next.t('validation:required.product.price'))
                .test('is-price-number', i18next.t('validation:number.order.price'), (value) => {
                    if (!value) return false;
                    return !isNaN(Number(value));
                })
                .test('is-price-positive', i18next.t('validation:positive.order.price'), (value) => {
                    if (!value) return false;
                    return Number(value) > 0;
                }),
            quantity: number()
                .required(i18next.t('validation:required.order.quantity'))
                .test('is-quantity-number', i18next.t('validation:number.order.quantity'), (value) => {
                    if (!value) return false;
                    return !isNaN(Number(value));
                })
                .test('is-quantity-positive', i18next.t('validation:positive.order.quantity'), (value) => {
                    if (!value) return false;
                    return Number(value) > 0;
                })
                .min(1, i18next.t('validation:min.order.quantity', { min: 1 })),
            totalAmount: string()
                .required(i18next.t('validation:required.order.total_amount'))
                .test('is-total-amount-number', i18next.t('validation:number.order.total_amount'), (value) => {
                    if (!value) return false;
                    return !isNaN(Number(value));
                })
                .test('is-total-amount-positive', i18next.t('validation:positive.order.total_amount'), (value) => {
                    if (!value) return false;
                    return Number(value) > 0;
                }),
        }),
    )
        .required(i18next.t('validation:required.order.items'))

        .min(1, i18next.t('validation:min.order.items', { min: 1 })),
    subtotalAmount: string()
        .required(i18next.t('validation:required.order.subtotal_amount'))
        .test('is-subtotal-amount-number', i18next.t('validation:number.order.subtotal_amount'), (value) => {
            if (!value) return false;
            return !isNaN(Number(value));
        })
        .test('is-subtotal-amount-positive', i18next.t('validation:positive.order.subtotal_amount'), (value) => {
            if (!value) return false;
            return Number(value) > 0;
        }),
    vatAmount: string()
        .required(i18next.t('validation:required.order.vat_amount'))
        .test('is-vat-amount-number', i18next.t('validation:number.order.vat_amount'), (value) => {
            if (!value) return false;
            return !isNaN(Number(value));
        })
        .test('is-vat-amount-positive', i18next.t('validation:positive.order.vat_amount'), (value) => {
            if (!value) return false;
            return Number(value) > 0;
        }),
    totalAmount: string()
        .required()
        .test('is-total-amount-number', i18next.t('validation:number.order.total_amount'), (value) => {
            if (!value) return false;
            return !isNaN(Number(value));
        })
        .test('is-total-amount-positive', i18next.t('validation:positive.order.total_amount'), (value) => {
            if (!value) return false;
            return Number(value) > 0;
        }),
    latitude: string(),
    longitude: string(),
    note: string(),
    scheduledDeliveryTime: string(),
    deliveryAddress: string(),
    discountAmount: string(),
    tableNumber: number(),
    vatRate: string().required(i18next.t('validation:required.order.vat_rate')),
    exchangeRate: string().required(i18next.t('validation:required.order.exchange_rate')),
    totalAmountInRiel: string()
        .required(i18next.t('validation:required.order.total_amount_in_riel'))
        .test('is-total-amount-in-riel-number', i18next.t('validation:number.order.total_amount_in_riel'), (value) => {
            if (!value) return false;
            return !isNaN(Number(value));
        })
        .test(
            'is-total-amount-in-riel-positive',
            i18next.t('validation:positive.order.total_amount_in_riel'),
            (value) => {
                if (!value) return false;
                return Number(value) > 0;
            },
        ),
});
