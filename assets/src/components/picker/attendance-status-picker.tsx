import React, { useId } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AttendanceStatus, AttendanceStatusEnum } from '@/types/attendance';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface AttendanceStatusPickerProps {
    label?: string;
    value?: AttendanceStatus;
    onChange?: (value: AttendanceStatus | undefined) => void;
    includeAllOption?: boolean;
    allLabel?: string;
    placeholder?: string;
}

export const AttendanceStatusPicker: React.FC<AttendanceStatusPickerProps> = ({
    label,
    value,
    onChange,
    includeAllOption = true,
    allLabel,
    placeholder,
}) => {
    const { t } = useTranslation();
    const selectId = useId();

    const statusOptions = Object.values(AttendanceStatusEnum);

    return (
        <div className="space-y-2">
            {label && (
                <Label htmlFor={selectId} className="text-xs text-muted-foreground">
                    {label}
                </Label>
            )}
            <Select
                value={value ?? '_null'}
                onValueChange={(v) => onChange?.(v === '_null' ? undefined : (v as AttendanceStatus))}
            >
                <SelectTrigger id={selectId} className={cn(!value && 'text-muted-foreground')}>
                    <SelectValue placeholder={placeholder ?? t('all')} />
                </SelectTrigger>
                <SelectContent>
                    {includeAllOption && <SelectItem value="_null">{allLabel ?? t('all')}</SelectItem>}
                    {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                            {t(`attendances.status.${status}`, { ns: 'glossary' })}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

AttendanceStatusPicker.displayName = 'AttendanceStatusPicker';
