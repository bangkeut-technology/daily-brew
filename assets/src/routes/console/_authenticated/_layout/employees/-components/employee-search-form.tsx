import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Grid, ListFilter, RotateCcw, Rows3, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import * as React from 'react';
import { EmployeeStatus } from '@/types/employee';
import { useTranslation } from 'react-i18next';
import { DatePicker } from '@/components/picker/date-picker';
import { RolePicker } from '@/components/picker/role-picker';
import { EmployeeStatusPicker } from '@/components/picker/employee-status-picker';

export type EmployeeSearchParams = {
    q: string;
    status?: EmployeeStatus;
    role: string;
    from: Date;
    to: Date;
    view?: 'grid' | 'table';
};

interface EmployeeSearchFormProps {
    params: EmployeeSearchParams;
    onChange: (patch: Partial<EmployeeSearchParams>) => void;
    onSearch?: () => void;
    onReset?: () => void;
}

export const EmployeeSearchForm: React.FunctionComponent<EmployeeSearchFormProps> = ({
    params,
    onSearch,
    onReset,
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
        <Card>
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
            <CardContent className="grid gap-3 md:grid-cols-6">
                <div className="md:col-span-2">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        <Search className="h-3 w-3" /> {t('search')}
                    </Label>
                    <Input
                        placeholder={t('employees.search_placeholder', { ns: 'glossary' }) || 'Search by name…'}
                        defaultValue={params.q ?? ''}
                        onChange={(e) => onChange({ q: e.target.value || undefined })}
                    />
                </div>

                {/* Status */}
                <div className="md:col-span-2">
                    <EmployeeStatusPicker
                        label={t('employees.status.title', { ns: 'glossary' })}
                        value={params.status}
                        onChange={(v) => onChange({ status: v || undefined })}
                    />
                </div>

                <div className="md:col-span-2">
                    <RolePicker value={params.role} onChange={(v) => onChange({ role: v || undefined })} />
                </div>

                <div className="md:col-span-3">
                    <Label className="text-xs text-muted-foreground">
                        {t('evaluations.period', { ns: 'glossary' })}
                    </Label>
                    <DatePicker label={t('from')} value={params.from} onChange={setFrom} className="md:col-span-3" />
                    <DatePicker label={t('to')} value={params.to} onChange={setTo} className="md:col-span-3" />
                </div>

                {/* View toggle (mobile) */}
                <div className="md:hidden flex items-end gap-2">
                    <Button
                        variant={params.view === 'grid' ? 'secondary' : 'outline'}
                        size="icon"
                        onClick={() => onChange({ view: 'grid' })}
                    >
                        <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={params.view === 'table' ? 'secondary' : 'outline'}
                        size="icon"
                        onClick={() => onChange({ view: 'table' })}
                    >
                        <Rows3 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
