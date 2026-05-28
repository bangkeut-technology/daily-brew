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

const SUPPORTED = new Set(['en', 'fr', 'km']);
const COOKIE_NAME = 'dailybrew_lang';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/**
 * Persist the user's choice in three places so the language survives every path:
 *   1. sessionStorage — instant client-side switch on subsequent client navigations
 *   2. `dailybrew_lang` cookie — picked up by SpaController on the next full page load,
 *      so the server-rendered meta tags + <html lang> match before any JS runs
 *   3. `?lang=…` query param via History API — shareable URL, matches sitemap variants
 */
function persistLocaleChoice(locale: string) {
    if (typeof window === 'undefined') return;

    if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('locale', locale);
    }

    // SameSite=Lax so the cookie travels on first-party top-level navs (incl. shares).
    document.cookie = `${COOKIE_NAME}=${locale}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;

    // Mirror the choice into the URL so a copy-paste of the address bar reproduces
    // the user's language. Don't push on default locale to keep canonical URLs clean.
    const url = new URL(window.location.href);
    if (locale === 'en') {
        url.searchParams.delete('lang');
    } else {
        url.searchParams.set('lang', locale);
    }
    window.history.replaceState(window.history.state, '', url.toString());
}

export function useLanguage() {
    const { i18n } = useTranslation();

    const changeLanguage = useCallback(
        (locale: string) => {
            if (!SUPPORTED.has(locale)) return;
            i18n.changeLanguage(locale);
            persistLocaleChoice(locale);
        },
        [i18n],
    );

    return { locale: i18n.language, changeLanguage };
}
