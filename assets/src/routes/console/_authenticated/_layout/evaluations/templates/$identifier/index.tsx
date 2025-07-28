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
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { EditEvaluationTemplateDialog } from '@/components/dialog/edit-evaluation-template-dialog';
import { AddEvaluationCriteriaDialog } from '@/components/dialog/add-evaluation-criteria-dialog';

export const Route = createFileRoute('/console/_authenticated/_layout/evaluations/templates/$identifier/')({
    component: EvaluationTemplateDetails,
    loader: ({ params: { identifier } }) => fetchEvaluationTemplate(identifier),
});

function EvaluationTemplateDetails() {
    const { identifier } = Route.useParams();
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { data, isPending } = useQuery({
        queryKey: ['evaluation-template', identifier],
        queryFn: () => fetchEvaluationTemplate(identifier),
        refetchOnWindowFocus: false,
    });
    const { data: criterias = [], isPending: isCriteriasPending } = useQuery({
        queryKey: ['evaluation-template-criterias', identifier],
        queryFn: () => fetchTemplateCriterias(identifier),
        enabled: data && !!data.identifier,
    });
    const { data: employees = [], isPending: isEmployeesPending } = useQuery({
        queryKey: ['evaluation-template-employees', identifier],
        queryFn: () => fetchTemplateEmployees(identifier),
        enabled: data && !!data.identifier,
    });

    const onEditSuccess = React.useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['evaluation-template', identifier] }).then();
    }, [identifier, queryClient]);

    const onRefreshCriterias = React.useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['evaluation-template-criterias', identifier] }).then();
    }, [identifier, queryClient]);

    const onRefreshEmployees = React.useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['evaluation-template-employees', identifier] }).then();
    }, [identifier, queryClient]);

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
                    <Button
                        size="sm"
                        variant="outline"
                        className="ml-2 mt-2 md:mt-0"
                        onClick={() => console.log('Add employee')}
                    >
                        {t('evaluation_templates.employees.add.title', { ns: 'glossary' })}
                    </Button>
                </CardHeader>
                <CardContent>
                    <EmployeeDataTable
                        identifier={identifier}
                        employees={employees}
                        loading={isEmployeesPending}
                        onRemoveEmployee={onRefreshEmployees}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
