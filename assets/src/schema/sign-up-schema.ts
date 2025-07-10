import { object, ObjectSchema, string } from 'yup';
import i18next from '@/i18next';
import { SignUpType } from '@/types/User';

export const signUpSchema: ObjectSchema<SignUpType> = object({
    username: string().required(i18next.t('validation:required.username')),
    password: string().required(i18next.t('validation:required.password')),
    confirmPassword: string()
        .required(i18next.t('validation:required.confirm_password'))
        .test('passwords-match', i18next.t('validation:passwords_match'), function (value) {
            return value === this.parent.password;
        }),
    firstName: string().required(i18next.t('validation:required.first_name')),
    lastName: string().required(i18next.t('validation:required.last_name')),
    companyName: string().required(i18next.t('validation:required.company_name')),
});
