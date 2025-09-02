export type Setting = {
    id: number;
    publicId: string;
    name: string;
    value: string;
};

export type PaidLeaveCycle = 'monthly' | 'yearly';

export type PartialSetting = Omit<Setting, 'id' | 'publicId'>;

export type SettingType = {
    numberOfPaidLeave: string;
    paidLeaveCycle: PaidLeaveCycle;
    maximumLateCount: string;
};
