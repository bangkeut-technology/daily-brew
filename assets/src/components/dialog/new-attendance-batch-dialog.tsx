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
import { useTranslation } from 'react-i18next';
import { useBoolean } from 'react-use';
import { useForm } from 'react-hook-form';
import { Attendance, AttendanceTypeEnum } from '@/types/attendance';
import { yupResolver } from '@hookform/resolvers/yup';
import { attendanceBatchSchema } from '@/schema/attendance-batch-schema';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { ClockPlus, Loader2Icon, Save } from 'lucide-react';
import { PartialAttendanceBatch } from '@/types/attendance-batch';
import { postAttendanceBatch } from '@/services/attendance-batch';
import { AttendanceBatchForm } from '@/components/form/attendance-batch-form';

const defaultValues: PartialAttendanceBatch = {
    fromDate: new Date(),
    toDate: new Date(),
    type: AttendanceTypeEnum.present,
    label: '',
    note: '',
};

interface NewAttendanceBatchDialogProps {
    attendance?: Attendance;
    button?: React.ReactNode;
}

export const NewAttendanceBatchDialog: React.FunctionComponent<NewAttendanceBatchDialogProps> = ({ button }) => {
    const { t } = useTranslation();
    const [open, setOpen] = useBoolean(false);
    const form = useForm<PartialAttendanceBatch>({
        resolver: yupResolver(attendanceBatchSchema),
        defaultValues,
    });
    const { mutate, isPending } = useMutation({
        mutationFn: postAttendanceBatch,
        onSuccess: (data) => {
            toast.success(data.message);
            setOpen(false);
            form.reset(defaultValues);
        },
        onError: (error) => {
            const errorMessage = isAxiosError(error) ? error.response?.data.message : t('occurred', { ns: 'error' });
            toast.error(errorMessage);
        },
    });

    const onSubmit = React.useCallback(
        (data: PartialAttendanceBatch) => {
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
                    <AttendanceBatchForm form={form} isPending={isPending} />
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

NewAttendanceBatchDialog.displayName = 'NewAttendanceBatchDialog';
