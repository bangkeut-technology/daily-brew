import React from 'react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type TextSeparatorProps = {
    text?: string;
    className?: string;
    children?: React.ReactNode;
};

export const TextSeparator: React.FC<TextSeparatorProps> = ({ text, className, children }) => (
    <div className={cn('relative flex items-center gap-2 w-full', className)}>
        <Separator className="flex-1" />
        <span className="shrink-0 px-2 text-muted-foreground text-xs uppercase">{text || children}</span>
        <Separator className="flex-1" />
    </div>
);

TextSeparator.displayName = 'TextSeparator';
