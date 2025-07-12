import React from 'react';
import { Locale } from '@/types/locale';

type LanguageContextValue = {
    locale: Locale;
    updateLocale: (locale: Locale) => void;
};

export const LanguageContext = React.createContext<LanguageContextValue>({
    locale: 'en',
    updateLocale: () => {},
});
