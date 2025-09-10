import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { fetchRecentEvaluations } from '@/services/employee-evaluation';
import { Loading } from '@/components/loader/loading';

export const RecentEvaluations = () => {
    const { t } = useTranslation();
    const { data = [], isPending } = useQuery({
        queryKey: ['recent-evaluations', '10'],
        queryFn: () => fetchRecentEvaluations(10),
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('recent_evaluations', { ns: 'glossary' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                {isPending ? (
                    <Loading loadingText="Loading recent evaluations..." />
                ) : data.length === 0 ? (
                    <p>No recent evaluations.</p>
                ) : (
                    data.map((evaluation) => (
                        <div key={evaluation.publicId} className="flex items-center justify-between">
                            <div className="truncate max-w-[55%]">{evaluation.employee.fullName}</div>
                            <div className="text-muted-foreground">{format(evaluation.evaluatedAt, 'MMM d')}</div>
                            <div className="font-medium">{(evaluation.averageScore || 0).toFixed(1)}</div>
                        </div>
                    ))
                )}
                <Separator />
                <Button variant="ghost" asChild className="w-full">
                    <Link to="/console/evaluations/histories">{t('see_all_evaluations', { ns: 'glossary' })}</Link>
                </Button>
            </CardContent>
        </Card>
    );
};
