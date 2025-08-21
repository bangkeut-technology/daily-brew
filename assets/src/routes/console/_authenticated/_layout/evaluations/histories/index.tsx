import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { HistoriesDataTable } from '@/routes/console/_authenticated/_layout/evaluations/histories/-components/histories-data-table';
import {
    HistoriesSearchParams,
    HistorySearchForm,
} from '@/routes/console/_authenticated/_layout/evaluations/histories/-components/history-search-form';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { DATE_FORMAT } from '@/constants/date';
import { format } from 'date-fns';

export const Route = createFileRoute('/console/_authenticated/_layout/evaluations/histories/')({
    component: EvaluationsHistoryPage,
    validateSearch: z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        employee: z.string().optional(),
        template: z.string().optional(),
    }),
});

function EvaluationsHistoryPage() {
    const { t } = useTranslation();
    const navigate = Route.useNavigate();
    const { from, to, employee, template } = Route.useSearch();
    const [params, setParams] = React.useState<HistoriesSearchParams>({
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
        employee: employee || '',
        template: template || '',
    });

    const onSearch = React.useCallback(() => {
        navigate({
            search: {
                from: params.from ? format(params.from, DATE_FORMAT) : undefined,
                to: params.to ? format(params.to, DATE_FORMAT) : undefined,
                employee: params.employee || undefined,
                template: params.template || undefined,
            },
        });
    }, [navigate, params.employee, params.from, params.template, params.to]);

    const onReset = React.useCallback(() => {
        setParams({ from: undefined, to: undefined, employee: '', template: '' });
        navigate({ search: { from: undefined, to: undefined, employee: undefined, template: undefined } });
    }, [navigate]);

    const onExportCsv = React.useCallback(() => {}, []);

    return (
        <div className="w-full px-6 py-5 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl md:text-3xl font-bold">{t('evaluations.histories', { ns: 'glossary' })}</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={onExportCsv}>
                        <Download className="h-4 w-4 mr-2" />
                        {t('export.csv')}
                    </Button>
                </div>
            </div>

            <HistorySearchForm
                params={params}
                onChange={(patch) => setParams((prevState) => ({ ...prevState, ...patch }))}
                onSearch={onSearch}
                onReset={onReset}
            />

            <HistoriesDataTable params={params} />
        </div>
    );
}
