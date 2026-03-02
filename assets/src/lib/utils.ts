import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import i18next from '@/i18next';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const errorHandler = (error: Error) => {
    if (isAxiosError(error)) {
        const message = error.response?.data.message;
        const description = error.response?.data.description;
        toast.error(message, { description });
        return;
    }
    toast.error(i18next.t('occurred', { ns: 'error' }));
};
