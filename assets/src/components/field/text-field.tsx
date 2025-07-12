import React from 'react';
import { Input } from '@/components/ui/input';
import { FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';

interface TextFieldProps extends React.ComponentProps<'input'> {
    control: Control<any>;
    name: string;
    label?: string;
    description?: string;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
}

export const TextField = React.memo<TextFieldProps>(
    ({ id, control, label, name, description, startIcon, endIcon, onChange, ...props }) => {
        const localId = React.useId();
        return (
            <FormField
                control={control}
                name={name}
                render={({ field }) => (
                    <FormItem className={props.className}>
                        {label && <FormLabel htmlFor={id || localId}>{label}</FormLabel>}
                        <div className="flex w-full items-center space-x-2">
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
