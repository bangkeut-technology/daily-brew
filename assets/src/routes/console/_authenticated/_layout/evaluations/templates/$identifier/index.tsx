import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { fetchEvaluationTemplate } from '@/services/evaluation-template';
import { useQuery } from '@tanstack/react-query';
import { Loading } from '@/components/loader/loading';
import { useTranslation } from 'react-i18next';
import { NotFound } from '@/components/not-found';
import { ClipboardX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export const Route = createFileRoute('/console/_authenticated/_layout/evaluations/templates/$identifier/')({
    component: EvaluationTemplateDetails,
    loader: ({ params: { identifier } }) => fetchEvaluationTemplate(identifier),
});

function EvaluationTemplateDetails() {
    const { identifier } = Route.useParams();
    const { t } = useTranslation();
    const { data, isPending } = useQuery({
        queryKey: ['evaluation-template', identifier],
        queryFn: () => fetchEvaluationTemplate(identifier),
        refetchOnWindowFocus: false,
    });

    if (isPending) {
        return <Loading loadingText={t('evaluation_templates.loading', { ns: 'glossary' })} />;
    }

    if (!data) {
        return (
            <NotFound icon={<ClipboardX />} notFoundText={t('evaluation_templates.not_found', { ns: 'glossary' })} />
        );
    }

    return (
        <div className="w-full px-6 py-4 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{data.name}</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('evaluation_templates.information', { ns: 'glossary' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {data.description && <p>{data.description}</p>}
                    <p>
                        <span className="font-semibold">{t('created_at')}:</span>{' '}
                        {format(new Date(data.createdAt), 'PPP')}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('evaluation_templates.criteria', { ns: 'glossary' })}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
                </CardContent>
            </Card>

            {/*<Card>*/}
            {/*    <CardHeader>*/}
            {/*        <CardTitle>{t('evaluation_templates.linked_employees', { ns: 'glossary' })}</CardTitle>*/}
            {/*    </CardHeader>*/}
            {/*    <CardContent>*/}
            {/*        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">*/}
            {/*            {data.employees.map((employee) => (*/}
            {/*                <div key={employee.id} className="border rounded-xl p-4 flex justify-between items-center">*/}
            {/*                    <div>*/}
            {/*                        <div className="font-semibold">*/}
            {/*                            {employee.firstName} {employee.lastName}*/}
            {/*                        </div>*/}
            {/*                        {employee.averageScore && (*/}
            {/*                            <div className="text-muted-foreground text-sm">*/}
            {/*                                {t('employees.kpi_score')}: {employee.averageScore}*/}
            {/*                            </div>*/}
            {/*                        )}*/}
            {/*                    </div>*/}
            {/*                    <Button*/}
            {/*                        size="sm"*/}
            {/*                        onClick={() =>*/}
            {/*                            router.navigate({*/}
            {/*                                to: '/console/_authenticated/_layout/employees/$identifier/',*/}
            {/*                                params: { identifier: employee.id },*/}
            {/*                            })*/}
            {/*                        }*/}
            {/*                    >*/}
            {/*                        {t('view')}*/}
            {/*                    </Button>*/}
            {/*                </div>*/}
            {/*            ))}*/}
            {/*        </div>*/}
            {/*    </CardContent>*/}
            {/*</Card>*/}
        </div>
    );
}
