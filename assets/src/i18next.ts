import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonEn from '@/locales/en/common.json';
import errorEn from '@/locales/en/error.json';
import glossaryEn from '@/locales/en/glossary.json';
import validationEn from '@/locales/en/validation.json';

import commonFr from '@/locales/fr/common.json';
import errorFr from '@/locales/fr/error.json';
import glossaryFr from '@/locales/fr/glossary.json';
import validationFr from '@/locales/fr/validation.json';

import commonKm from '@/locales/km/common.json';
import errorKm from '@/locales/km/error.json';
import glossaryKm from '@/locales/km/glossary.json';
import validationKm from '@/locales/km/validation.json';

export const defaultNS = 'common';

export const resources = {
    en: {
        common: commonEn,
        error: errorEn,
        glossary: glossaryEn,
        validation: validationEn,
    },
    fr: {
        common: commonFr,
        error: errorFr,
        glossary: glossaryFr,
        validation: validationFr,
    },
    km: {
        common: commonKm,
        error: errorKm,
        glossary: glossaryKm,
        validation: validationKm,
    },
};

i18next
    .use(initReactI18next)
    .init({
        resources,
        defaultNS,
        lng: 'en',
        fallbackLng: 'en',
        supportedLngs: ['en', 'fr', 'km'],
        interpolation: {
            escapeValue: false,
        },
        cleanCode: true,
        ns: ['common', 'error', 'glossary', 'validation'],

        compatibilityJSON: 'v4',
    })
    .then();

export default i18next;
