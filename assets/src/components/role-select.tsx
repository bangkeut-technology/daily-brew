import React from 'react';
import { Control } from 'react-hook-form';
import { SelectField } from '@/components/select-field';
import { RoleOptions } from '@/constants/role';
import { useTranslation } from 'react-i18next';

interface RoleSelectProps {
    control: Control<any>;
    name: string;
    label?: string;
    disabled?: boolean;
}

export const RoleSelect: React.FC<RoleSelectProps> = ({ control, name, label, disabled }) => {
    const { t } = useTranslation();

    return (
        <SelectField
            control={control}
            name={name}
            label={label}
            disabled={disabled}
            placeholder={t('placeholder.select.role', { ns: 'glossary' })}
            options={RoleOptions}
        />
    );
};
