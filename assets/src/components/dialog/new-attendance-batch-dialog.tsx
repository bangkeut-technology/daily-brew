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
import { postAttendance } from '@/services/attendance';
import { ClockPlus, Loader2Icon, Save } from 'lucide-react';

const defaultValues: PartialAttendanceBatch = {
    employee: undefined,
    attendanceDate: new Date(),
    type: AttendanceTypeEnum.present,
    note: '',
    clockIn: undefined,
    clockOut: undefined,
};

interface NewAttendanceDialogProps {
    attendance?: Attendance;
    attendanceDate?: Date;
    employee?: Employee;
    button?: React.ReactNode;
}

export const NewAttendanceDialog: React.FunctionComponent<NewAttendanceDialogProps> = ({
    attendanceDate = new Date(),
    employee,
    button,
}) => {
    const { t } = useTranslation();
    const [open, setOpen] = useBoolean(false);
    const form = useForm<PartialAttendance>({
        resolver: yupResolver(attendanceSchema),
        defaultValues: {
            ...defaultValues,
            attendanceDate,
            employee: employee?.id ? employee.id.toString() : '_null',
        },
    });
    const { mutate, isPending } = useMutation({
        mutationFn: postAttendance,
        onSuccess: (data) => {
            toast.success(data.message);
            setOpen(false);
            form.reset({ ...defaultValues, attendanceDate });
        },
        onError: (error) => {
            const errorMessage = isAxiosError(error) ? error.response?.data.message : t('occurred', { ns: 'error' });
            toast.error(errorMessage);
        },
    });

    const onSubmit = React.useCallback(
        (data: PartialAttendance) => {
            mutate(data);
        },
        [mutate],
    );

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
                <DialogTitle>{t('attendances.new.title', { ns: 'glossary' })}</DialogTitle>
                <DialogDescription>{t('attendances.new.description', { ns: 'glossary' })}</DialogDescription>
                <div className="grid gap-4">
                    <AttendanceForm form={form} isPending={isPending} />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button disabled={isPending} variant="outline">
                            {t('cancel')}
                        </Button>
                    </DialogClose>
                    <Button disabled={isPending} type="button" onClick={form.handleSubmit(onSubmit)}>
                        {isPending ? (
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

NewAttendanceDialog.displayName = 'NewAttendanceDialog';
