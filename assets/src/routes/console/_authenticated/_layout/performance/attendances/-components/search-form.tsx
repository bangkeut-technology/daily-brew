import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/picker/date-picker';
import { useTranslation } from 'react-i18next';
import { EmployeePicker } from '@/components/picker/employee-picker';

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
                <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select value={localStatus} onValueChange={setLocalStatus}>
                        <SelectTrigger>
                            <SelectValue placeholder="Any status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">Any status</SelectItem>
                            {Object.keys(STATUS_COLORS).map((s) => (
                                <SelectItem key={s} value={s}>
                                    {s}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="q">Search</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="q"
                            placeholder="Name or note…"
                            className="pl-9"
                            value={localQ}
                            onChange={(e) => setLocalQ(e.target.value)}
                        />
                    </div>
                </div>

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
