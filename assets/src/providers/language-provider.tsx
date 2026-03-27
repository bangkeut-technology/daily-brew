import React, { useCallback, useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthentication } from '@/hooks/use-authentication';

interface Props {
    children: ReactNode;
}

export function LanguageProvider({ children }: Props) {
    const { i18n } = useTranslation();
    const { user } = useAuthentication();

    useEffect(() => {
        const locale = user?.locale || sessionStorage.getItem('locale') || 'en';
        if (i18n.language !== locale) {
            i18n.changeLanguage(locale);
        }
        sessionStorage.setItem('locale', locale);
    }, [user, i18n]);

    return <>{children}</>;
}

export function useLanguage() {
    const { i18n } = useTranslation();

    const changeLanguage = useCallback(
        (locale: string) => {
            i18n.changeLanguage(locale);
            sessionStorage.setItem('locale', locale);
        },
        [i18n],
    );

    return { locale: i18n.language, changeLanguage };
}
