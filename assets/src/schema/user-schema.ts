import { date, object, ObjectSchema, string } from 'yup';
import { PartialUser, PartialUserWithoutPassword } from '@/types/User';
import i18next from '@/i18next';

export const userSchema: ObjectSchema<PartialUser> = object({
    firstName: string().required(i18next.t('validation:required.user.first_name')),
    lastName: string().required(i18next.t('validation:required.user.last_name')),
    username: string().required(i18next.t('validation:required.user.username')),
    password: string().required(i18next.t('validation:required.user.password')),
    confirmPassword: string()
        .required(i18next.t('validation:required.user.confirm_password'))
        .test('passwords-match', i18next.t('validation:match.password'), function (value) {
            return this.parent.password === value;
        }),
    dob: date().required(i18next.t('validation:required.user.dob')),
    role: string().required(i18next.t('validation:required.user.role')),
});

export const userWithoutPasswordSchema: ObjectSchema<PartialUserWithoutPassword> = object({
    firstName: string().required(i18next.t('validation:required.user.first_name')),
    lastName: string().required(i18next.t('validation:required.user.first_name')),
    username: string().required(i18next.t('validation:required.user.first_name')),
    dob: date().required(i18next.t('validation:required.user.first_name')),
    role: string().required(i18next.t('validation:required.user.first_name')),
});
