import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListFilter, RotateCcw, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/picker/date-picker';
import { EmployeePicker } from '@/components/picker/employee-picker';
import { EvaluationTemplatePicker } from '@/components/picker/template-picker';

export type HistoriesSearchParams = {
    from: Date | undefined;
    to: Date | undefined;
    employee: string;
    template: string;
};

interface HistorySearchFormProps {
    params: HistoriesSearchParams;
    onChange: (patch: Partial<HistoriesSearchParams>) => void;
    onSearch?: () => void;
    onReset?: () => void;
    className?: string;
}

export const HistorySearchForm: React.FC<HistorySearchFormProps> = ({
    onSearch,
    onReset,
    className,
    params,
    onChange,
}) => {
    const { t } = useTranslation();

    const setFrom = React.useCallback(
        (date?: Date) => {
            if (!date) return;
            const to = params.to ?? date;
            onChange({ from: date, to: date > to ? date : to });
        },
        [onChange, params.to],
    );

    const setTo = React.useCallback(
        (date?: Date) => {
            if (!date) return;
            const from = params.from ?? date;
            onChange({ to: date, from: date < from ? date : from });
        },
        [onChange, params.from],
    );

    const handleReset = React.useCallback(() => {
        if (onReset) {
            onReset();
        }
    }, [onReset]);

    return (
        <Card className={className}>
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <ListFilter className="h-4 w-4" />
                    {t('filters')}
                </CardTitle>
                <div className="flex items-center gap-2">
                    {onReset && (
                        <Button variant="ghost" size="sm" onClick={handleReset}>
                            <RotateCcw className="h-4 w-4 mr-1" />
                            {t('reset')}
                        </Button>
                    )}
                    {onSearch && (
                        <Button size="sm" onClick={onSearch}>
                            <Search className="h-4 w-4 mr-1" />
                            {t('search')}
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-6">
                <DatePicker label={t('from')} value={params.from} onChange={setFrom} className="md:col-span-3" />
                <DatePicker label={t('to')} value={params.to} onChange={setTo} className="md:col-span-3" />
                <EmployeePicker
                    label={t('employee')}
                    value={params.employee}
                    onChange={(employee) => onChange({ employee })}
                    className="md:col-span-3 w-full"
                />
                <EvaluationTemplatePicker
                    label={t('evaluation_templates')}
                    value={params.template}
                    onChange={(template) => onChange({ template })}
                    className="md:col-span-2 w-full"
                />
            </CardContent>
        </Card>
    );
};
