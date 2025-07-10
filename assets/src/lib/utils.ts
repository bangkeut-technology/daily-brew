import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toHex } from '@/lib/string';
import { ChartConfig } from '@/components/ui/chart';
import { CategoryShare } from '@/types/Category';
import { ProductShare } from '@/types/Product';
import { PaymentMethodAmount } from '@/types/PaymentMethod';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const getChartConfig = (data: CategoryShare[] | ProductShare[] | PaymentMethodAmount[]): ChartConfig => {
    const chartConfig: ChartConfig = {};
    if (data.length) {
        data.forEach((item) => {
            chartConfig[item.canonicalName] = {
                label: item.name,
                color: item.color || toHex(item.canonicalName),
            };
        });
    }

    return chartConfig;
};
