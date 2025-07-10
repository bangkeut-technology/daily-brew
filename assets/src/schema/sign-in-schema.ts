import { object, ObjectSchema, string } from 'yup';
import i18next from '@/i18next';
import { SignInType } from '@/types/User';

export const signInSchema: ObjectSchema<SignInType> = object({
    username: string().required(i18next.t('validation:required.username')),
    password: string().required(i18next.t('validation:required.password')),
});
