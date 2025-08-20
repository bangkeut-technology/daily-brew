import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { HistoriesDataTable } from '@/routes/console/_authenticated/_layout/evaluations/histories/-histories-data-table';
import {
    HistoriesSearchParams,
    HistorySearchForm,
} from '@/routes/console/_authenticated/_layout/evaluations/histories/-search-form';
import { z } from 'zod';

export const Route = createFileRoute('/console/_authenticated/_layout/evaluations/histories/')({
    component: EvaluationsHistoryPage,
    validateSearch: z.object({
        from: z.date().optional(),
        to: z.date().optional(),
        employeeId: z.string().optional(),
        templateId: z.string().optional(),
    }),
});

function EvaluationsHistoryPage() {
    const navigate = Route.useNavigate();
    const { from, to, employeeId, templateId } = Route.useSearch();
    const [params, setParams] = React.useState<HistoriesSearchParams>({
        from,
        to,
        employeeId: employeeId || '',
        templateId: templateId || '',
    });

    const onSearch = React.useCallback(() => {
        navigate({
            search: {
                from: params.from,
                to: params.to,
                employeeId: params.employeeId || undefined,
                templateId: params.templateId || undefined,
            },
        });
    }, [navigate, params.employeeId, params.from, params.templateId, params.to]);

    const onReset = React.useCallback(() => {
        setParams({ from: undefined, to: undefined, employeeId: '', templateId: '' });
        navigate({ search: { from: undefined, to: undefined, employeeId: undefined, templateId: undefined } });
    }, [navigate]);

    const onExportCsv = React.useCallback(() => {}, []);

    return (
        <div className="w-full px-6 py-5 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl md:text-3xl font-bold">Evaluation History</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={onExportCsv}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                </div>
            </div>

            <HistorySearchForm
                value={params}
                onChange={(patch) => setParams((prevState) => ({ ...prevState, ...patch }))}
                onSearch={onSearch}
                onReset={onReset}
            />

            <HistoriesDataTable params={params} />
        </div>
    );
}
