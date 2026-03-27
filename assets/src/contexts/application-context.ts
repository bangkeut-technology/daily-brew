import { createContext } from 'react';

export interface ApplicationConfig {
    maxFreeEmployees: number;
    contactEmail: string;
}

export const ApplicationContext = createContext<ApplicationConfig>({
    maxFreeEmployees: 5,
    contactEmail: 'support@dailybrew.work',
});
