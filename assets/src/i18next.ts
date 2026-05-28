import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonEn from '@/locales/en/common.json';
import commonFr from '@/locales/fr/common.json';
import commonKm from '@/locales/km/common.json';

export const defaultNS = 'common';

export const resources = {
    en: { common: commonEn },
    fr: { common: commonFr },
    km: { common: commonKm },
};

/**
 * Resolve the starting locale in this priority order:
 *   1. `?lang=fr` query param — explicit choice from a shared link / sitemap variant.
 *   2. `sessionStorage.locale` — sticky preference set by the language switcher.
 *   3. `window.__DAILYBREW__.initialLocale` — server's per-request decision, which
 *      already considered the cookie + Accept-Language header. Using it means the
 *      first paint matches the <html lang> and meta tags the crawler/preview just read.
 *   4. 'en' fallback.
 */
function resolveInitialLocale(): string {
    const supported = ['en', 'fr', 'km'] as const;
    const pickIfSupported = (raw: string | null | undefined): string | null => {
        if (!raw) return null;
        const lower = raw.toLowerCase().split(/[-_]/)[0];
        return (supported as readonly string[]).includes(lower) ? lower : null;
    };

    if (typeof window !== 'undefined') {
        const fromQuery = pickIfSupported(new URLSearchParams(window.location.search).get('lang'));
        if (fromQuery) return fromQuery;
    }

    if (typeof sessionStorage !== 'undefined') {
        const fromSession = pickIfSupported(sessionStorage.getItem('locale'));
        if (fromSession) return fromSession;
    }

    if (typeof window !== 'undefined') {
        const fromServer = pickIfSupported(
            (window as { __DAILYBREW__?: { initialLocale?: string } }).__DAILYBREW__?.initialLocale,
        );
        if (fromServer) return fromServer;
    }

    return 'en';
}

i18next
    .use(initReactI18next)
    .init({
        resources,
        defaultNS,
        lng: resolveInitialLocale(),
        fallbackLng: 'en',
        supportedLngs: ['en', 'fr', 'km'],
        ns: ['common'],
        interpolation: {
            escapeValue: false,
        },
    });

export default i18next;
