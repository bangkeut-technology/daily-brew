import React from 'react';
import { Control } from 'react-hook-form';
import { FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { HexColorPicker } from 'react-colorful';

interface ColorPickerProps {
    control: Control<any>;
    name: string;
    disabled?: boolean;
    label?: string;
    id?: string;
    description?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ control, name, label, id, description }) => {
    const localId = React.useId();

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    {label && <FormLabel htmlFor={id || localId}>{label}</FormLabel>}
                    <div className="flex w-full items-center space-x-2">
                        <HexColorPicker color={field.value} onChange={field.onChange} />
                    </div>
                    <FormMessage />
                    {description && <FormDescription>{description}</FormDescription>}
                </FormItem>
            )}
        />
    );
};
