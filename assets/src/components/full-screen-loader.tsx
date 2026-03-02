import React from 'react';

type FullScreenLoaderProps = {
    text?: string;
};

export const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ text = 'Checking session...' }) => (
    <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-muted border-t-primary" />
            <span className="text-sm text-muted-foreground">{text}</span>
        </div>
    </div>
);

FullScreenLoader.displayName = 'FullScreenLoader';
