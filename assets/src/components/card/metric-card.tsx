import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface MetricCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    suffix?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, suffix }) => {
    return (
        <Card>
            <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 grid place-items-center rounded-lg bg-primary/10 text-primary">{icon}</div>
                <div className="flex-1">
                    <div className="text-sm text-muted-foreground">{label}</div>
                    <div className="text-2xl font-bold tracking-tight">
                        {value}
                        {suffix ? <span className="text-base font-medium text-muted-foreground"> {suffix}</span> : null}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

MetricCard.displayName = 'MetricCard';
