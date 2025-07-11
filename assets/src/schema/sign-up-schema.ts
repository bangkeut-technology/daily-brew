import i18next from '@/i18next';
import { object, ObjectSchema, string } from 'yup';
import { SignUp } from '@/types/user';

export const signUpSchema: ObjectSchema<SignUp> = object({
    email: string().required(i18next.t('validation:required.email')),
    password: string().required(i18next.t('validation:required.password')),
    confirmPassword: string()
        .required(i18next.t('validation:required.confirm_password'))
        .test('passwords-match', i18next.t('validation:passwords_match'), function (value) {
            return value === this.parent.password;
        }),
    firstName: string().required(i18next.t('validation:required.first_name')),
    lastName: string().required(i18next.t('validation:required.last_name')),
});
