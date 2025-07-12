import React from 'react';
import { Control } from 'react-hook-form';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MultipleSelect } from '@/components/ui/multiple-select';
import { Option } from './select-field';
import { cn } from '@/lib/utils';

interface MultipleSelectFieldProps {
    control: Control<any>;
    name: string;
    label?: string;
    disabled?: boolean;
    placeholder?: string;
    nullValue?: string;
    options: Option[];
    description?: string;
    className?: string;
    animation?: number;
    maxCount?: number;
}

export const MultipleSelectField: React.FC<MultipleSelectFieldProps> = ({
    control,
    name,
    label,
    placeholder,
    disabled,
    options,
    description,
    className,
    animation = 2,
    maxCount = 3,
}) => (
    <div className={cn('flex flex-row space-x-2 items-end', className)}>
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    {label && <FormLabel>{label}</FormLabel>}
                    <FormControl>
                        <MultipleSelect
                            onValueChange={field.onChange}
                            value={field.value}
                            placeholder={placeholder}
                            disabled={disabled}
                            options={options}
                            animation={animation}
                            maxCount={maxCount}
                        />
                    </FormControl>
                    <FormMessage />
                    {description && <FormDescription>{description}</FormDescription>}
                </FormItem>
            )}
        />
    </div>
);
