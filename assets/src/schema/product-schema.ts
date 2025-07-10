import { number, object, ObjectSchema, string } from 'yup';
import { PartialProduct } from '@/types/Product';
import i18next from '@/i18next';

export const productSchema: ObjectSchema<PartialProduct> = object({
    name: string().required(i18next.t('validation:required.product.name')),
    description: string(),
    price: string()
        .required(i18next.t('validation:required.product.price'))
        .test('is-price', i18next.t('validation:number.product.price'), (value) => !isNaN(parseFloat(value)))
        .test('is-positive', i18next.t('validation:positive.product.price'), (value) => parseFloat(value) > 0),
    category: number()
        .required(i18next.t('validation:required.product.category'))
        .test('is-category', i18next.t('validation:number.product.category'), (value) => !isNaN(value))
        .test('is-positive', i18next.t('validation:positive.product.category'), (value) => value > 0),
    color: string(),
});
