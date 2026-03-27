import { useContext } from 'react';
import { ApplicationContext } from '@/contexts/application-context';

export function useApplication() {
    return useContext(ApplicationContext);
}
