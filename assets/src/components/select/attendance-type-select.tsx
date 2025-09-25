import React from 'react';
import { SelectField } from '@/components/field/select-field';
import { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AttendanceTypeEnum } from '@/types/attendance';

export interface AttendanceTypeSelectProps {
    className?: string;
    control: Control<any>;
    name: string;
    label: string;
    disabled?: boolean;
}

export const AttendanceTypeSelect: React.FC<AttendanceTypeSelectProps> = ({
    control,
    className,
    name,
    label,
    disabled,
}) => {
    const { t } = useTranslation();

    const options = React.useMemo(() => {
        return Object.entries(AttendanceTypeEnum).map(([_, value]) => ({
            value,
            label: t(`attendance_types.${value}`),
        }));
    }, [t]);

    return (
        <SelectField
            className={className}
            control={control}
            name={name}
            label={label}
            options={options}
            disabled={disabled}
        />
    );
};
