import React from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Matcher } from 'react-day-picker';

interface DatePickerProps {
    control: Control<any>;
    name: string;
    label?: string;
    disabled?: boolean;
    description?: string;
    className?: string;
    disabledDate?: Matcher | Matcher[] | undefined;
}

export const DatePicker: React.FC<DatePickerProps> = ({
    control,
    name,
    label,
    disabled,
    description,
    className,
    disabledDate,
}) => {
    const { t } = useTranslation();
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={cn('flex flex-col', className)}>
                    {label && <FormLabel>{label}</FormLabel>}
                    <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    disabled={disabled}
                                    variant="outline"
                                    className={cn(
                                        'w-[240px] pl-3 text-left font-normal',
                                        !field.value && 'text-muted-foreground',
                                        className,
                                    )}
                                >
                                    {field.value ? (
                                        format(field.value, 'PPP')
                                    ) : (
                                        <span>{t('placeholder.picker.date', { ns: 'glossary' })}</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={disabledDate}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    {description && <FormDescription>{description}</FormDescription>}
                </FormItem>
            )}
        />
    );
};
