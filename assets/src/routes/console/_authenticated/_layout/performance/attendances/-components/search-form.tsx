import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/picker/date-picker';
import { useTranslation } from 'react-i18next';
import { EmployeePicker } from '@/components/picker/employee-picker';
import { AttendanceStatusPicker } from '@/components/picker/attendance-status-picker';
import { Button } from '@/components/ui/button';

interface SearchFormProps {}

export const SearchForm: React.FC<SearchFormProps> = () => {
    const { t } = useTranslation();

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Filters</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-5">
                <DatePicker label={t('from')} />
                <DatePicker label={t('to')} />
                <EmployeePicker />
                <AttendanceStatusPicker />

                <div className="md:col-span-5 flex items-center justify-end gap-2">
                    <Button variant="outline" onClick={resetFilters}>
                        Reset
                    </Button>
                    <Button onClick={applyFilters}>Search</Button>
                </div>
            </CardContent>
        </Card>
    );
};
