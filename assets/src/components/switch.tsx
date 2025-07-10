import React from 'react';
import { Control } from 'react-hook-form';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch as BaseSwitch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface SwitchProps {
    control: Control<any>;
    name: string;
    className?: string;
    label?: string;
    description?: string;
}

export const Switch: React.FC<SwitchProps> = ({ control, name, className, label, description }) => {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={cn('flex flex-row justify-between, items-center', className)}>
                    <div className="space-y-0.5">
                        {label && <FormLabel className="text-base">{label}</FormLabel>}
                        {description && <FormDescription>{description}</FormDescription>}
                    </div>
                    <FormControl>
                        <BaseSwitch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                </FormItem>
            )}
        />
    );
};
