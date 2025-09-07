import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';

export const UpcomingLeaves = () => {
    const { t } = useTranslation();
    const { data } = useQuery({
        queryKey: ['upcoming-leaves'],
        queryFn: () => {
            return Promise.resolve([]);
        },
        enabled: false,
    });
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('upcoming_leave')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                {[
                    { name: 'Mey', from: new Date(), to: new Date() },
                    { name: 'Boran', from: new Date(), to: new Date() },
                ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="truncate max-w-[55%]">{row.name}</div>
                        <div className="text-muted-foreground">
                            {format(row.from, 'MMM d')} – {format(row.to, 'MMM d')}
                        </div>
                        <Badge variant="secondary">Approved</Badge>
                    </div>
                ))}
                <Separator />
                <Button variant="ghost" asChild className="w-full">
                    <Link to="/console/leaves">Open leave board</Link>
                </Button>
            </CardContent>
        </Card>
    );
};
