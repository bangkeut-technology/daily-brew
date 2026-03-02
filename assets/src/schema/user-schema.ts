import i18next from '@/i18next';
import { z } from 'zod';

export const userSchema = z.object({
    firstName: z.string({
        message: i18next.t('validation:required.users.first_name'),
    }),
    lastName: z.string({
        message: i18next.t('validation:required.users.last_name'),
    }),
});
