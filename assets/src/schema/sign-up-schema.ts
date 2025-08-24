import i18next from '@/i18next';
import { boolean, object, ObjectSchema, string } from 'yup';
import { SignUp } from '@/types/user';

const passwordSchema = string()
    .min(8, 'At least 8 characters')
    .matches(/[A-Z]/, 'Include at least one uppercase letter')
    .matches(/[a-z]/, 'Include at least one lowercase letter')
    .matches(/\d/, 'Include at least one number');

export const signUpSchema: ObjectSchema<SignUp> = object({
    email: string().required(i18next.t('validation:required.users.email')),
    password: passwordSchema.required(i18next.t('validation:required.users.password')),
    confirmPassword: passwordSchema
        .required(i18next.t('validation:required.users.confirm_password'))
        .test('passwords-match', i18next.t('validation:passwords_match'), function (value) {
            return value === this.parent.password;
        }),
    firstName: string().required(i18next.t('validation:required.users.first_name')),
    lastName: string().required(i18next.t('validation:required.users.last_name')),
    acceptedTerms: boolean()
        .required(i18next.t('validation:accept_terms'))
        .isTrue(i18next.t('validation:accept_terms')),
});
