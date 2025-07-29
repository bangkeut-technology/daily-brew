import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { fetchEvaluationCriteria, fetchTemplateCriterias } from '@/services/evaluation-criteria';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loading } from '@/components/loader/loading';
import { useTranslation } from 'react-i18next';
import { NotFound } from '@/components/not-found';
import { ClipboardX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { AddEvaluationTemplateDialog } from '@/components/dialog/add-evaluation-template-dialog';
import { EditEvaluationCriteriaDialog } from '@/components/dialog/edit-evaluation-criteria-dialog';
import { EvaluationCriteriaTemplateDataTable } from '@/components/data-table/evaluation-criteria-template-data-table';

export const Route = createFileRoute('/console/_authenticated/_layout/evaluations/criterias/$publicId/')({
    component: EvaluationTemplateDetails,
});

function EvaluationTemplateDetails() {
    const { publicId } = Route.useParams();
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { data, isPending } = useQuery({
        queryKey: ['evaluation-criteria', publicId],
        queryFn: () => fetchEvaluationCriteria(publicId),
        refetchOnWindowFocus: false,
    });
    const { data: templates = [], isPending: isCriteriasPending } = useQuery({
        queryKey: ['evaluation-criteria-templates', publicId],
        queryFn: () => fetchTemplateCriterias(publicId),
        enabled: data && !!data.publicId,
    });

    const onEditSuccess = React.useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['evaluation-criteria', publicId] }).then();
    }, [publicId, queryClient]);

    const onRefreshTemplates = React.useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['evaluation-criteria-templates', publicId] }).then();
    }, [publicId, queryClient]);

    if (isPending) {
        return <Loading loadingText={t('evaluation_criterias.loading', { ns: 'glossary' })} />;
    }

    if (!data) {
        return (
            <NotFound icon={<ClipboardX />} notFoundText={t('evaluation_criterias.not_found', { ns: 'glossary' })} />
        );
    }

    return (
        <div className="w-full px-6 py-4 space-y-6">
            <div className="flex flex-wrap items-center">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{data.label}</h1>
                <EditEvaluationCriteriaDialog className="ml-2 mt-2 md:mt-0" criteria={data} onSuccess={onEditSuccess} />
            </div>

            <Separator />

            {data.description && (
                <div className="text-sm md:text-base text-muted-foreground leading-relaxed">{data.description}</div>
            )}

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg md:text-xl">
                        {t('evaluation_criterias.information', { ns: 'glossary' })}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm md:text-base text-muted-foreground">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span>{t('weight')}:</span>
                        <span className="font-medium text-foreground">{data.weight}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span>{t('created_at')}:</span>
                        <span className="font-medium text-foreground">{format(new Date(data.createdAt), 'PPP')}</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-wrap items-center">
                    <CardTitle className="text-base sm:text-lg md:text-xl">
                        {t('evaluation_criterias.template.title', { ns: 'glossary' })}
                    </CardTitle>
                    <AddEvaluationTemplateDialog criteria={data} onSuccess={onRefreshTemplates} />
                </CardHeader>
                <CardContent>
                    <EvaluationCriteriaTemplateDataTable
                        templates={templates}
                        loading={isCriteriasPending}
                        onRemoveTemplate={onRefreshTemplates}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
