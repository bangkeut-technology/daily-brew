import React from 'react';
import { useRouter } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const BackButton = () => {
    const { t } = useTranslation();
    const location = useRouter();

    const onBack = React.useCallback(() => location.history.back(), [location.history]);

    return (
        <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft />
            {t('back')}
        </Button>
    );
};
