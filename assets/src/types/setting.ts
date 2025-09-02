export type Setting = {
    id: number;
    publicId: string;
    name: string;
    value: string;
};

export type PaidLeaveCycle = 'monthly' | 'yearly';

export type PartialSetting = Omit<Setting, 'id' | 'publicId'>;

export type SubmitSetting = {
    numberOfPaidLeave: string;
    paidLeaveCycle: PaidLeaveCycle;
    maximumLateCount: string;
};

export type SettingType = {
    number_of_paid_leave: string;
    paid_leave_cycle: PaidLeaveCycle;
    maximum_late_count: string;
};
