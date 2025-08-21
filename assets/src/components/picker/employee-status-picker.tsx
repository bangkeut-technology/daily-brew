import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmployeeStatusEnum } from '@/types/employee';
import { useTranslation } from 'react-i18next';

interface EmployeeStatusPickerProps {
    label?: string;
    value?: string;
    onChange?: (value: any) => void;
}

export const EmployeeStatusPicker: React.FC<EmployeeStatusPickerProps> = ({ label, value, onChange }) => {
    const { t } = useTranslation();

    return (
        <React.Fragment>
            {label && <Label className="text-xs text-muted-foreground">{label}</Label>}
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder={t('all')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="">{t('all')}</SelectItem>
                    <SelectItem value={EmployeeStatusEnum.active}>
                        {t('employees.status.active', { ns: 'glossary' })}
                    </SelectItem>
                    <SelectItem value={EmployeeStatusEnum.on_leave}>
                        {t('employees.status.on_leave', { ns: 'glossary' })}
                    </SelectItem>
                    <SelectItem value={EmployeeStatusEnum.probation}>
                        {t('employees.status.probation', { ns: 'glossary' })}
                    </SelectItem>
                    <SelectItem value={EmployeeStatusEnum.resigned}>
                        {t('employees.status.resigned', { ns: 'glossary' })}
                    </SelectItem>
                    <SelectItem value={EmployeeStatusEnum.suspended}>
                        {t('employees.status.suspended', { ns: 'glossary' })}
                    </SelectItem>
                </SelectContent>
            </Select>
        </React.Fragment>
    );
};

EmployeeStatusPicker.displayName = 'EmployeeStatusPicker';
