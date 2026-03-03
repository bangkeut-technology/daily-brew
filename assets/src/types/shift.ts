import { Employee } from '@/types/employee';

export enum DayOfWeekEnum {
    MONDAY = 1,
    TUESDAY = 2,
    WEDNESDAY = 3,
    THURSDAY = 4,
    FRIDAY = 5,
    SATURDAY = 6,
    SUNDAY = 7,
}

export const DAY_LABELS: Record<DayOfWeekEnum, string> = {
    [DayOfWeekEnum.MONDAY]: 'Monday',
    [DayOfWeekEnum.TUESDAY]: 'Tuesday',
    [DayOfWeekEnum.WEDNESDAY]: 'Wednesday',
    [DayOfWeekEnum.THURSDAY]: 'Thursday',
    [DayOfWeekEnum.FRIDAY]: 'Friday',
    [DayOfWeekEnum.SATURDAY]: 'Saturday',
    [DayOfWeekEnum.SUNDAY]: 'Sunday',
};

export type ShiftTimeRule = {
    id: number;
    publicId: string;
    dayOfWeek: DayOfWeekEnum;
    dayLabel: string;
    startTime: string;
    endTime: string;
    createdAt: string;
    updatedAt: string;
};

export type Shift = {
    id: number;
    publicId: string;
    name: string;
    graceLateMinutes: number;
    graceEarlyMinutes: number;
    timeRules: ShiftTimeRule[];
    employees: Employee[];
    createdAt: string;
    updatedAt: string;
};

export type CreateShiftPayload = {
    name: string;
    graceLateMinutes: number;
    graceEarlyMinutes: number;
};

export type CreateTimeRulePayload = {
    dayOfWeek: DayOfWeekEnum;
    startTime: string;
    endTime: string;
};
