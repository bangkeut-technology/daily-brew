import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonEn from '@/locales/en/common.json';
import validationEn from '@/locales/en/validation.json';
import glossaryEn from '@/locales/en/glossary.json';

import commonFr from '@/locales/fr/common.json';
import validationFr from '@/locales/fr/validation.json';
import glossaryFr from '@/locales/fr/glossary.json';

import commonKm from '@/locales/km/common.json';
import validationKm from '@/locales/km/validation.json';
import glossaryKm from '@/locales/km/glossary.json';

export const defaultNS = 'common';

export const resources = {
    en: {
        common: commonEn,
        validation: validationEn,
        glossary: glossaryEn,
    },
    fr: {
        common: commonFr,
        validation: validationFr,
        glossary: glossaryFr,
    },
    km: {
        common: commonKm,
        validation: validationKm,
        glossary: glossaryKm,
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
        ns: ['common', 'validation', 'glossary'],

        compatibilityJSON: 'v4',
    })
    .then();

export default i18next;
