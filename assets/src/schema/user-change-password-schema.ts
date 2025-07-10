import { object, ObjectSchema, string } from 'yup';
import { ChangePassword } from '@/types/User';
import i18next from '@/i18next';

export const userChangePasswordSchema: ObjectSchema<ChangePassword> = object({
    password: string().required(i18next.t('validation:required.password')),
    confirmPassword: string()
        .required(i18next.t('validation:required.confirm_password'))
        .test('passwords-match', i18next.t('validation:match.password'), function (value) {
            return this.parent.password === value;
        }),
});
