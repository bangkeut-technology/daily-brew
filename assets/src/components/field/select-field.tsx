import React, { useId } from 'react';
import { Control } from 'react-hook-form';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type Option = {
    value: string;
    label: string;
    disabled?: boolean;
};

interface SelectFieldProps {
    control: Control<any>;
    name: string;
    label?: string;
    disabled?: boolean;
    placeholder?: string;
    nullValue?: string;
    options: Option[];
    description?: string;
    className?: string;
}

export const SelectField = React.memo<SelectFieldProps>(
    ({ control, name, label, placeholder, disabled, options, description, className, nullValue = '_null' }) => {
        const id = useId();

        return (
            <div className={cn('flex flex-row space-x-2 items-end', className)}>
                <FormField
                    control={control}
                    name={name}
                    render={({ field }) => (
                        <FormItem className={className}>
                            {label && <FormLabel id={id}>{label}</FormLabel>}
                            <Select name={name} onValueChange={field.onChange} value={field.value?.toString()}>
                                <FormControl>
                                    <SelectTrigger disabled={disabled} className="w-full">
                                        <SelectValue placeholder={placeholder} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {placeholder && <SelectItem value={nullValue}>{placeholder}</SelectItem>}
                                    {options.map((option, index) => (
                                        <SelectItem
                                            key={`${id}-select-item-${index}}`}
                                            value={option.value.toString()}
                                            disabled={option.disabled}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            {description && <FormDescription>{description}</FormDescription>}
                        </FormItem>
                    )}
                />
            </div>
        );
    },
);

SelectField.displayName = 'SelectField';
