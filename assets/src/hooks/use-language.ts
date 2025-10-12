import React from 'react';
import { LanguageContext } from '@/contexts/language-context';

export const useLanguage = () => React.useContext(LanguageContext);
