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
    onChange?: (value: string) => void;
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
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className={className}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {nullable && <SelectItem value="">{placeholder}</SelectItem>}
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
