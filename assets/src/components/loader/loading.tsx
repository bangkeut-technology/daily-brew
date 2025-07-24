import React from 'react';
import { Loader2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
    className?: string;
    icon?: React.ReactNode;
    loadingText: string;
}

export const Loading: React.FC<LoadingProps> = ({
    className,
    icon = <Loader2Icon className="animate-spin w-16 h-16 mb-4" />,
    loadingText,
}) => (
    <div className={cn('w-full h-full flex flex-col justify-center items-center', className)}>
        {icon}
        <h4>{loadingText}</h4>
    </div>
);

Loading.displayName = 'Loading';
