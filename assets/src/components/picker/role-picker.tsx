import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchRoles } from '@/services/role';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RolePickerProps {
    className?: string;
    label?: string;
    date?: Date;
    nullable?: boolean;
    value?: string;
    onChange?: (value: string | undefined) => void;
}

export const RolePicker: React.FunctionComponent<RolePickerProps> = ({
    className,
    label,
    nullable,
    value,
    onChange,
}) => {
    const { t } = useTranslation();
    const { data = [] } = useQuery({
        queryKey: ['roles'],
        queryFn: () => fetchRoles(),
    });

    const placeholder = React.useMemo(() => t('placeholder.picker.role', { ns: 'glossary' }), [t]);

    return (
        <div className="flex flex-col space-y-2">
            {label && <Label>{label}</Label>}
            <Select
                value={value || '_null'}
                onValueChange={(value) => {
                    onChange?.(value === '_null' ? undefined : value);
                }}
            >
                <SelectTrigger className={className}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {nullable && <SelectItem value="_null">{placeholder}</SelectItem>}
                    {data.map((e) => (
                        <SelectItem key={e.publicId} value={e.publicId}>
                            {e.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

RolePicker.displayName = 'RolePicker';
