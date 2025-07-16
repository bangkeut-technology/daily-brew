import { object, ObjectSchema, string } from 'yup';
import i18next from '@/i18next';
import { SignIn } from '@/types/user';

export const signInSchema: ObjectSchema<SignIn> = object({
    email: string().required(i18next.t('validation:required.users.email')),
    password: string().required(i18next.t('validation:required.users.password')),
});
