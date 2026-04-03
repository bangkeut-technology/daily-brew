import { createContext } from 'react';

export interface ApplicationConfig {
    maxFreeEmployees: number;
    contactEmail: string;
    googleClientId: string;
    appleClientId: string;
}

export const ApplicationContext = createContext<ApplicationConfig>({
    maxFreeEmployees: 5,
    contactEmail: 'support@mail.dailybrew.work',
    googleClientId: '',
    appleClientId: '',
});
