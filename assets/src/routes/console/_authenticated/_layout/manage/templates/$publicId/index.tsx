import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
    fetchEvaluationTemplate,
    fetchTemplateCriterias,
    fetchTemplateEmployees,
} from '@/services/evaluation-template';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loading } from '@/components/loader/loading';
import { useTranslation } from 'react-i18next';
import { NotFound } from '@/components/not-found';
import { ClipboardX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { EvaluationTemplateCriteriaDataTable } from '@/components/data-table/evaluation-template-criteria-data-table';
import { EmployeeDataTable } from '@/components/data-table/employee-data-table';
import { Separator } from '@/components/ui/separator';
import { EditEvaluationTemplateDialog } from '@/components/dialog/edit-evaluation-template-dialog';
import { AddEvaluationCriteriaDialog } from '@/components/dialog/add-evaluation-criteria-dialog';
import { AddEmployeeDialog } from '@/components/dialog/add-employee-dialog';

export const Route = createFileRoute('/console/_authenticated/_layout/manage/templates/$publicId/')({
    component: EvaluationTemplateDetails,
    loader: ({ params: { publicId } }) => fetchEvaluationTemplate(publicId),
});

function EvaluationTemplateDetails() {
    const { publicId } = Route.useParams();
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { data, isPending } = useQuery({
        queryKey: ['evaluation-template', publicId],
        queryFn: () => fetchEvaluationTemplate(publicId),
        refetchOnWindowFocus: false,
    });
    const { data: criterias = [], isPending: isCriteriasPending } = useQuery({
        queryKey: ['evaluation-template-criterias', publicId],
        queryFn: () => fetchTemplateCriterias(publicId),
        enabled: data && !!data.publicId,
    });
    const { data: employees = [], isPending: isEmployeesPending } = useQuery({
        queryKey: ['evaluation-template-employees', publicId],
        queryFn: () => fetchTemplateEmployees(publicId),
        enabled: data && !!data.publicId,
    });

    const onEditSuccess = React.useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['evaluation-template', publicId] }).then();
    }, [publicId, queryClient]);

    const onRefreshCriterias = React.useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['evaluation-template-criterias', publicId] }).then();
    }, [publicId, queryClient]);

    const onRefreshEmployees = React.useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['evaluation-template-employees', publicId] }).then();
    }, [publicId, queryClient]);

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
            <div className="flex flex-wrap items-center">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{data.name}</h1>
                <EditEvaluationTemplateDialog className="ml-2 mt-2 md:mt-0" template={data} onSuccess={onEditSuccess} />
            </div>

            <Separator />

            {data.description && (
                <div className="text-sm md:text-base text-muted-foreground leading-relaxed">{data.description}</div>
            )}

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg md:text-xl">
                        {t('evaluation_templates.information', { ns: 'glossary' })}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm md:text-base text-muted-foreground">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="font-medium text-foreground">{t('created_at')}:</span>
                        <span>{format(new Date(data.createdAt), 'PPP')}</span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-wrap items-center">
                    <CardTitle className="text-base sm:text-lg md:text-xl">
                        {t('evaluation_templates.criteria.title', { ns: 'glossary' })}
                    </CardTitle>
                    <AddEvaluationCriteriaDialog template={data} onSuccess={onRefreshCriterias} />
                </CardHeader>
                <CardContent>
                    <EvaluationTemplateCriteriaDataTable
                        criterias={criterias}
                        loading={isCriteriasPending}
                        onRemoveCriteria={onRefreshCriterias}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-wrap items-center">
                    <CardTitle className="text-base sm:text-lg md:text-xl">
                        {t('evaluation_templates.employees.linked', { ns: 'glossary' })}
                    </CardTitle>
                    <AddEmployeeDialog template={data} onSuccess={onRefreshEmployees} />
                </CardHeader>
                <CardContent>
                    <EmployeeDataTable
                        publicId={publicId}
                        employees={employees}
                        loading={isEmployeesPending}
                        onRemoveEmployee={onRefreshEmployees}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
