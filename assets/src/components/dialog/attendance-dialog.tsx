import React from 'react';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Employee } from '@/types/employee';
import { useTranslation } from 'react-i18next';
import { useBoolean } from 'react-use';
import { useForm } from 'react-hook-form';
import { Attendance, AttendanceTypeEnum, PartialAttendance } from '@/types/attendance';
import { yupResolver } from '@hookform/resolvers/yup';
import { attendanceSchema } from '@/schema/attendance-schema';
import { Button } from '@/components/ui/button';
import { AttendanceForm } from '@/components/form/attendance-form';
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { postAttendance, putAttendance } from '@/services/attendance';
import { ClockPlus, Loader2Icon, Save } from 'lucide-react';

const defaultValues: PartialAttendance = {
    employee: undefined,
    attendanceDate: new Date(),
    type: AttendanceTypeEnum.present,
    note: '',
    clockIn: undefined,
    clockOut: undefined,
};

interface AttendanceDialogProps {
    attendance?: Attendance;
    attendanceDate?: Date;
    employee?: Employee;
    button?: React.ReactNode;
    onSuccess?: (attendance: Attendance) => void;
}

export const AttendanceDialog: React.FunctionComponent<AttendanceDialogProps> = ({
    attendance,
    attendanceDate = new Date(),
    employee,
    button,
    onSuccess,
}) => {
    const { t } = useTranslation();
    const [open, setOpen] = useBoolean(false);
    const form = useForm<PartialAttendance>({
        resolver: yupResolver(attendanceSchema),
        defaultValues: {
            ...defaultValues,
            attendanceDate: attendance?.attendanceDate ? new Date(attendance?.attendanceDate) : attendanceDate,
            note: attendance?.note ?? '',
            type: attendance?.type ?? AttendanceTypeEnum.present,
            employee: employee?.id ? employee.id.toString() : '_null',
        },
    });
    const { mutate, isPending } = useMutation({
        mutationFn: postAttendance,
        onSuccess: (data) => {
            toast.success(data.message);
            setOpen(false);
            form.reset({ ...defaultValues, attendanceDate });
            onSuccess?.(data.attendance);
        },
        onError: (error) => {
            const errorMessage = isAxiosError(error) ? error.response?.data.message : t('occurred', { ns: 'error' });
            toast.error(errorMessage);
        },
    });
    const { mutate: putMutate, isPending: isPutPending } = useMutation({
        mutationFn: putAttendance,
        onSuccess: (data) => {
            toast.success(data.message);
            setOpen(false);
            form.reset({ ...defaultValues, attendanceDate });
            onSuccess?.(data.attendance);
        },
        onError: (error) => {
            const errorMessage = isAxiosError(error) ? error.response?.data.message : t('occurred', { ns: 'error' });
            toast.error(errorMessage);
        },
    });

    const onSubmit = React.useCallback(
        (data: PartialAttendance) => {
            if (attendance) {
                putMutate({ publicId: attendance.publicId, attendance: data });
                return;
            }
            mutate(data);
        },
        [attendance, mutate, putMutate],
    );

    const isLoading = isPending || isPutPending;
    const isEdit = attendance !== undefined;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {button ? (
                    button
                ) : (
                    <Button className="bg-amber-500 hover:bg-amber-500/90">
                        <ClockPlus />
                        {t('attendances.new.title', { ns: 'glossary' })}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>
                    {isEdit
                        ? t('attendances.edit.title', { ns: 'glossary' })
                        : t('attendances.new.title', { ns: 'glossary' })}
                </DialogTitle>
                <DialogDescription>
                    {isEdit
                        ? t('attendances.edit.description', { ns: 'glossary' })
                        : t('attendances.new.description', { ns: 'glossary' })}
                </DialogDescription>
                <div className="grid gap-4">
                    <AttendanceForm form={form} isPending={isLoading} />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button disabled={isLoading} variant="outline">
                            {t('cancel')}
                        </Button>
                    </DialogClose>
                    <Button disabled={isLoading} type="button" onClick={form.handleSubmit(onSubmit)}>
                        {isLoading ? (
                            <React.Fragment>
                                <Loader2Icon className="animate-spin" />
                                {t('saving')}
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <Save />
                                {t('attendances.new.save', { ns: 'glossary' })}
                            </React.Fragment>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

AttendanceDialog.displayName = 'AttendanceDialog';
