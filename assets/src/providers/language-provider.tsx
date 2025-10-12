import React from 'react';
import { LanguageContext } from '@/contexts/language-context';
import { Locale } from '@/types/locale';
import i18next from '@/i18next';
import { toast } from 'sonner';
import { useAuthenticationState } from '@/hooks/use-authentication';

interface LanguageProviderProps {
    children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [locale, setLocale] = React.useState<Locale>('en');
    const { user, isAuthenticated } = useAuthenticationState();

    const updateLocale = React.useCallback((locale: Locale) => {
        i18next
            .changeLanguage(locale)
            .then(() => {
                setLocale(locale);
            })
            .catch((error) => {
                toast.error(error.message);
            });
    }, []);

    React.useEffect(() => {
        if (isAuthenticated && user) {
            updateLocale((user.locale as Locale) || 'en');
        }
    }, [isAuthenticated, user, updateLocale]);

    return <LanguageContext.Provider value={{ locale, updateLocale }}>{children}</LanguageContext.Provider>;
};
