import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';

interface CheckboxFieldProps {
    control: any;
    name: string;
    label?: React.ReactNode;
    id?: string;
    disabled?: boolean;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({ control, label, name, id, disabled }) => {
    const localId = React.useId();
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => {
                return (
                    <FormItem key={id || localId} className="flex flex-row items-center gap-2">
                        <FormControl>
                            <Checkbox
                                disabled={disabled}
                                id={id || localId}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        {label && <FormLabel className="text-sm font-normal">{label}</FormLabel>}
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
};
