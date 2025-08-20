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
    value: HistoriesSearchParams;
    onChange: (patch: Partial<HistoriesSearchParams>) => void;
    onSearch?: () => void;
    onReset?: () => void;
    className?: string;
}

export const HistorySearchForm: React.FC<HistorySearchFormProps> = ({
    onSearch,
    onReset,
    className,
    value,
    onChange,
}) => {
    const { t } = useTranslation();

    const setFrom = React.useCallback(
        (date?: Date) => {
            if (!date) return;
            const to = value.to ?? date;
            onChange({ from: date, to: date > to ? date : to });
        },
        [onChange, value.to],
    );

    const setTo = React.useCallback(
        (date?: Date) => {
            if (!date) return;
            const from = value.from ?? date;
            onChange({ to: date, from: date < from ? date : from });
        },
        [onChange, value.from],
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
                <DatePicker label={t('from')} value={value.from} onChange={setFrom} className="md:col-span-3" />
                <DatePicker label={t('to')} value={value.to} onChange={setTo} className="md:col-span-3" />
                <EmployeePicker
                    label={t('employee')}
                    value={value.employee}
                    onChange={(employee) => onChange({ employee })}
                    className="md:col-span-3 w-full"
                />
                <EvaluationTemplatePicker
                    label={t('evaluation_templates')}
                    value={value.template}
                    onChange={(template) => onChange({ template })}
                    className="md:col-span-2 w-full"
                />
            </CardContent>
        </Card>
    );
};
