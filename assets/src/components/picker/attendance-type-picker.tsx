import React, { useId } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AttendanceType, AttendanceTypeEnum } from '@/types/attendance';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface AttendanceTypePickerProps {
    label?: string;
    value?: AttendanceType;
    onChange?: (value: AttendanceType | undefined) => void;
    includeAllOption?: boolean;
    allLabel?: string;
    placeholder?: string;
}

export const AttendanceTypePicker: React.FC<AttendanceTypePickerProps> = ({
    label,
    value,
    onChange,
    includeAllOption = true,
    allLabel,
    placeholder,
}) => {
    const { t } = useTranslation();
    const selectId = useId();

    const typeOptions = Object.values(AttendanceTypeEnum);

    return (
        <div className="space-y-2">
            {label && (
                <Label htmlFor={selectId} className="text-xs text-muted-foreground">
                    {label}
                </Label>
            )}
            <Select
                value={value ?? '_null'}
                onValueChange={(v) => onChange?.(v === '_null' ? undefined : (v as AttendanceType))}
            >
                <SelectTrigger id={selectId} className={cn(!value && 'text-muted-foreground')}>
                    <SelectValue placeholder={placeholder ?? t('all')} />
                </SelectTrigger>
                <SelectContent>
                    {includeAllOption && <SelectItem value="_null">{allLabel ?? t('all')}</SelectItem>}
                    {typeOptions.map((type) => (
                        <SelectItem key={type} value={type}>
                            {t(`attendances.type.${type}`, { ns: 'glossary' })}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

AttendanceTypePicker.displayName = 'AttendanceTypePicker';
