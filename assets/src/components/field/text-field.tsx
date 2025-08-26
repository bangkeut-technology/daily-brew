import React from 'react';
import { Input } from '@/components/ui/input';
import { FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { cn } from '@/lib/utils';

interface TextFieldProps extends React.ComponentProps<'input'> {
    control: Control<any>;
    name: string;
    label?: string;
    description?: string;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    labelRight?: React.ReactNode;
}

export const TextField = React.memo<TextFieldProps>(
    ({ id, control, label, name, description, startIcon, endIcon, labelRight, onChange, ...props }) => {
        const localId = React.useId();
        return (
            <FormField
                control={control}
                name={name}
                render={({ field }) => (
                    <FormItem className={cn('space-y-2', props.className)}>
                        <div className="flex items-center justify-between">
                            {label && <FormLabel htmlFor={id || localId}>{label}</FormLabel>}
                            {labelRight}
                        </div>
                        <div className="relative">
                            {startIcon && startIcon}
                            <Input
                                {...props}
                                {...field}
                                onChange={(event) => {
                                    field.onChange(event);
                                    if (onChange) {
                                        onChange(event);
                                    }
                                }}
                                id={id || localId}
                                className={cn('w-full', startIcon && 'pl-9', endIcon && 'pr-9', props.className)}
                            />
                            {endIcon && endIcon}
                        </div>
                        <FormMessage />
                        {description && <FormDescription>{description}</FormDescription>}
                    </FormItem>
                )}
            />
        );
    },
);

TextField.displayName = 'TextField';
