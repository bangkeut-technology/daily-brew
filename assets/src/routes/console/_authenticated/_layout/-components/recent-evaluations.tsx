import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const RecentEvaluations = () => {
    const { t } = useTranslation();

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('recent_evaluations', { ns: 'glossary' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                {[
                    { name: 'Sovan', score: 4.3, date: new Date() },
                    { name: 'Chanthy', score: 3.9, date: new Date() },
                    { name: 'Mey', score: 4.8, date: new Date() },
                ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="truncate max-w-[55%]">{row.name}</div>
                        <div className="text-muted-foreground">{format(row.date, 'MMM d')}</div>
                        <div className="font-medium">{row.score.toFixed(1)}</div>
                    </div>
                ))}
                <Separator />
                <Button variant="ghost" asChild className="w-full">
                    <Link to="/console/evaluations/histories">{t('see_all_evaluations', { ns: 'glossary' })}</Link>
                </Button>
            </CardContent>
        </Card>
    );
};
