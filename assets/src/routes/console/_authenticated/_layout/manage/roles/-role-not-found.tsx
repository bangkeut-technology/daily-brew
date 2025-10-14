import * as React from 'react';
import { Briefcase, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const RoleNotFound: React.FunctionComponent = () => {
    const { t } = useTranslation();

    return (
        <div className="w-full h-full flex flex-col justify-center items-center gap-4">
            <UserX className="w-32 h-32 mb-4 text-primary" />
            <p className="text-xl text-primary font-bold">{t('roles.not_found.title', { ns: 'glossary' })}</p>
            <span className="text-md text-muted-foreground">
                {t('roles.not_found.description', { ns: 'glossary' })}
            </span>
            <Button asChild>
                <Link to="/console/manage/roles">
                    <Briefcase className="w-4 h-4" />
                    {t('roles.not_found.button', { ns: 'glossary' })}
                </Link>
            </Button>
        </div>
    );
};
