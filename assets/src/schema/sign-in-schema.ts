import { object, ObjectSchema, string } from 'yup';
import i18next from '@/i18next';
import { SignInType } from '@/types/user';

export const signInSchema: ObjectSchema<SignInType> = object({
    email: string().required(i18next.t('validation:required.email')),
    password: string().required(i18next.t('validation:required.password')),
});
