import React, { useId } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Control } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Option } from '@/components/field/select-field';
import { RovingFocusGroupProps } from '@radix-ui/react-roving-focus';

interface RadioProps {
    control: Control<any>;
    name: string;
    label?: string;
    options: Option[];
    orientation?: RovingFocusGroupProps['orientation'];
}

export const Radio: React.FunctionComponent<RadioProps> = ({ control, name, label, options, orientation }) => {
    const id = useId();
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className="space-y-3">
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <RadioGroup orientation={orientation} onValueChange={field.onChange} defaultValue={field.value}>
                            {options.map((option, index) => (
                                <FormItem className="flex items-center space-x-3 space-y-0" key={`${id}-${index}`}>
                                    <FormControl>
                                        <RadioGroupItem disabled={option.disabled} value={option.value} />
                                    </FormControl>
                                    <FormLabel className="font-normal">{option.label}</FormLabel>
                                </FormItem>
                            ))}
                        </RadioGroup>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};
