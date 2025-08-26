import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AttendanceStatusEnum } from '@/types/attendance';
import { useTranslation } from 'react-i18next';

interface AttendanceStatusPickerProps {
    label?: string;
    value?: AttendanceStatusEnum;
    onChange?: (value: AttendanceStatusEnum) => void;
}

export const AttendanceStatusPicker: React.FC<AttendanceStatusPickerProps> = ({ label, value, onChange }) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-2">
            {label && <Label className="text-xs text-muted-foreground">{label}</Label>}
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger>
                    <SelectValue placeholder={t('all')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="">{t('all')}</SelectItem>
                    <SelectItem value={AttendanceStatusEnum.absent}>
                        {t(`attendances.status.${AttendanceStatusEnum.absent}`, { ns: 'glossary' })}
                    </SelectItem>
                    <SelectItem value={AttendanceStatusEnum.present}>
                        {t(`attendances.status.${AttendanceStatusEnum.present}`, { ns: 'glossary' })}
                    </SelectItem>
                    <SelectItem value={AttendanceStatusEnum.late}>
                        {t(`attendances.status.${AttendanceStatusEnum.late}`, { ns: 'glossary' })}
                    </SelectItem>
                    <SelectItem value={AttendanceStatusEnum.leave}>
                        {t(`attendances.status.${AttendanceStatusEnum.leave}`, { ns: 'glossary' })}
                    </SelectItem>
                    <SelectItem value={AttendanceStatusEnum.sick}>
                        {t(`attendances.status.${AttendanceStatusEnum.sick}`, { ns: 'glossary' })}
                    </SelectItem>
                    <SelectItem value={AttendanceStatusEnum.remote}>
                        {t(`attendances.status.${AttendanceStatusEnum.remote}`, { ns: 'glossary' })}
                    </SelectItem>
                    <SelectItem value={AttendanceStatusEnum.holiday}>
                        {t(`attendances.status.${AttendanceStatusEnum.holiday}`, { ns: 'glossary' })}
                    </SelectItem>
                    <SelectItem value={AttendanceStatusEnum.unknown}>
                        {t(`attendances.status.${AttendanceStatusEnum.unknown}`, { ns: 'glossary' })}
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
};
