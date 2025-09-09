import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmployeeStatus, EmployeeStatusEnum } from '@/types/employee';
import { useTranslation } from 'react-i18next';

interface EmployeeStatusPickerProps {
    label?: string;
    value?: EmployeeStatus;
    onChange?: (value: EmployeeStatus | undefined) => void;
}

export const EmployeeStatusPicker: React.FunctionComponent<EmployeeStatusPickerProps> = ({
    label,
    value,
    onChange,
}) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-2">
            {label && <Label className="text-xs text-muted-foreground">{label}</Label>}
            <Select
                value={value || '_null'}
                onValueChange={(value) => {
                    onChange?.(value === '_null' ? undefined : (value as EmployeeStatus));
                }}
            >
                <SelectTrigger>
                    <SelectValue placeholder={t('all')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="_null">{t('all')}</SelectItem>
                    <SelectItem value={EmployeeStatusEnum.active}>
                        {t(`employees.status.${EmployeeStatusEnum.active}`, { ns: 'glossary' })}
                    </SelectItem>
                    <SelectItem value={EmployeeStatusEnum.on_leave}>
                        {t(`employees.status.${EmployeeStatusEnum.on_leave}`, { ns: 'glossary' })}
                    </SelectItem>
                    <SelectItem value={EmployeeStatusEnum.probation}>
                        {t(`employees.status.${EmployeeStatusEnum.probation}`, { ns: 'glossary' })}
                    </SelectItem>
                    <SelectItem value={EmployeeStatusEnum.resigned}>
                        {t(`employees.status.${EmployeeStatusEnum.resigned}`, { ns: 'glossary' })}
                    </SelectItem>
                    <SelectItem value={EmployeeStatusEnum.suspended}>
                        {t(`employees.status.${EmployeeStatusEnum.suspended}`, { ns: 'glossary' })}
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
};

EmployeeStatusPicker.displayName = 'EmployeeStatusPicker';
