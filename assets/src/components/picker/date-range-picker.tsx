import React, { useId } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { useTranslation } from 'react-i18next';
import { DateRange } from 'react-day-picker';
import { Label } from '@/components/ui/label';
import { DISPLAY_DATE_FORMAT } from '@/constants/date';

type OnChangeHandler = (date: DateRange | undefined) => void;

interface DateRangePickerProps {
    label?: string;
    disabled?: boolean;
    description?: string;
    displayFormat?: string;
    className?: string;
    value: DateRange | undefined;
    onChange?: OnChangeHandler;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
    label,
    disabled,
    description,
    className,
    displayFormat = DISPLAY_DATE_FORMAT,
    value,
    onChange,
}) => {
    const id = useId();
    const { t } = useTranslation();

    return (
        <div className={cn('flex flex-col gap-3', className)}>
            {label && (
                <Label htmlFor="date" className="px-1" id={id}>
                    {label}
                </Label>
            )}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id={id}
                        disabled={disabled}
                        variant="outline"
                        className={cn('w-full pl-3 text-left font-normal', value && 'text-muted-foreground')}
                    >
                        {value?.from && value?.to ? (
                            `${format(value.from, displayFormat)} - ${format(value.to, displayFormat)}`
                        ) : (
                            <span>{t('placeholder.picker.date', { ns: 'glossary' })}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        className="w-full"
                        mode="range"
                        defaultMonth={value?.from}
                        selected={value}
                        onSelect={onChange}
                        disableNavigation
                        startMonth={value?.from}
                        fixedWeeks
                        showOutsideDays
                    />
                </PopoverContent>
            </Popover>
            {description && (
                <p data-slot="form-description" className="text-muted-foreground text-sm">
                    {description}
                </p>
            )}
        </div>
    );
};
