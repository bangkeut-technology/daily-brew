import { object, ObjectSchema, string } from 'yup';
import { ChangePassword } from '@/types/user';
import i18next from '@/i18next';

export const userChangePasswordSchema: ObjectSchema<ChangePassword> = object({
    password: string().required(i18next.t('validation:required.users.password')),
    confirmPassword: string()
        .required(i18next.t('validation:required.users.confirm_password'))
        .test('passwords-match', i18next.t('validation:passwords_match'), function (value) {
            return this.parent.password === value;
        }),
});
