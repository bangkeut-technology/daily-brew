import { ChartConfig } from '@/components/ui/chart';
import { toHex } from '@/lib/string';
import { DAYS, MONTHS } from '@/constants/date';
import { format, lastDayOfMonth } from 'date-fns';
import { Period } from '@/reducers/period.reducer';

export type ItemsStackedType = Array<{ xAxis: string } & Partial<{ [key: string]: string }>>;

export type BarStackedDataAndConfigType = [ItemsStackedType, ChartConfig];

export const getStackedDataAndChartConfig = (
    data: any[],
    items: ItemsStackedType,
    dataKey = 'share',
): BarStackedDataAndConfigType => {
    const chartConfig: ChartConfig = {};
    data.forEach((item) => {
        if (item.period) {
            const index = item.period - 1;
            chartConfig[item.canonicalName] = {
                label: item.name,
                color: item.color || toHex(item.canonicalName),
            };
            items[index][item.canonicalName] = item[dataKey].toLocaleString();
        }
    });
    return [items, chartConfig];
};

export const getBarStackedDataAndConfig = (
    data: any[],
    period: Period,
    date: Date,
    dataKey = 'share',
): BarStackedDataAndConfigType => {
    const items: ItemsStackedType = [];
    switch (period) {
        case 'D': {
            for (let i = 1; i <= 24; i++) {
                items.push({ xAxis: i.toLocaleString().padStart(2, '0') });
            }
            break;
        }
        case 'W': {
            for (let i = 0; i < 7; i++) {
                items.push({ xAxis: DAYS[i] });
            }
            break;
        }
        case 'M': {
            const length = Number(format(lastDayOfMonth(date), 'dd'));
            for (let i = 1; i <= length; i++) {
                items.push({ xAxis: i.toLocaleString().padStart(2, '0') });
            }
            break;
        }

        case 'Y':
            for (let i = 0; i < 12; i++) {
                items.push({ xAxis: MONTHS[i] });
            }
            break;
    }
    return getStackedDataAndChartConfig(data, items, dataKey);
};

export const getChartData = (data: any[], period: Period, date: Date, keys: string[]) => {
    const items: Array<any & { xAxis: string }> = [];
    const tmpData: { [key: string]: any } = {};
    const defaultItem = Object.fromEntries(keys.map((k) => [k, 0]));
    data.forEach((item) => {
        if (item.period) {
            tmpData[item.period] = { ...item };
            delete tmpData[item.period].period;
        }
    });
    switch (period) {
        case 'D': {
            for (let i = 1; i <= 24; i++) {
                const index = i - 1;
                const item = tmpData[index] || defaultItem;
                items.push({ xAxis: i.toLocaleString().padStart(2, '0') });
                Object.keys(item).forEach((key) => {
                    items[index][key] = Number(item[key]);
                });
            }
            break;
        }
        case 'W': {
            for (let i = 0; i < 7; i++) {
                const item = tmpData[i] || defaultItem;
                items.push({ xAxis: DAYS[i] });
                Object.keys(item).forEach((key) => {
                    items[i][key] = Number(item[key]);
                });
            }
            break;
        }
        case 'M': {
            const length = Number(format(lastDayOfMonth(date), 'dd'));
            for (let i = 1; i <= length; i++) {
                const index = i - 1;
                const item = tmpData[i] || defaultItem;
                items.push({ xAxis: i.toLocaleString().padStart(2, '0') });
                Object.keys(item).forEach((key) => {
                    items[index][key] = Number(item[key]);
                });
            }
            break;
        }

        case 'Y':
            for (let i = 0; i < 12; i++) {
                const index = i + 1;
                const item = tmpData[index] || defaultItem;
                items.push({ xAxis: MONTHS[i], ...item });
                Object.keys(item).forEach((key) => {
                    items[i][key] = Number(item[key]);
                });
            }
            break;
    }
    return items;
};
