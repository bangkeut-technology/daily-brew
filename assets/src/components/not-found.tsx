import React from 'react';
import { cn } from '@/lib/utils';
import { BackButton } from '@/components/button/back-button';

interface NotFoundProps {
    className?: string;
    icon?: React.ReactNode;
    notFoundText?: string;
}

export const NotFound: React.FC<NotFoundProps> = ({ className, icon, notFoundText }) => {
    return (
        <div className={cn('w-full h-full flex flex-col justify-center items-center space-y-4', className)}>
            {icon}
            <h4 className="text-lg text-muted-foreground">{notFoundText}</h4>
            <BackButton />
        </div>
    );
};
