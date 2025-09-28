import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useTranslation } from 'react-i18next';
import { deleteAttendanceBatch } from '@/services/attendance-batch';

interface DeleteAttendanceBatchButonProps {
    attendanceBatchPublicId: string;
    withText?: boolean;
    onRemove?: () => void;
}

export const DeleteAttendanceBatchButon: React.FunctionComponent<DeleteAttendanceBatchButonProps> = ({
    attendanceBatchPublicId,
    withText,
    onRemove,
}) => {
    const { t } = useTranslation();
    const { mutate, isPending } = useMutation({
        mutationFn: deleteAttendanceBatch,
        onSuccess: (data) => {
            toast.success(data.message);
            if (onRemove) {
                onRemove();
            }
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data.message : t('occurred', { ns: 'error' });
            toast.error(message);
        },
    });

    const handleRemove = React.useCallback(() => {
        mutate(attendanceBatchPublicId);
    }, [mutate, attendanceBatchPublicId]);

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size={withText ? 'default' : 'icon'} disabled={isPending}>
                    <Trash2 className="h-4 w-4" />
                    {withText && t('attendance_batches.delete.button', { ns: 'glossary' })}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('attendance_batches.delete.title', { ns: 'glossary' })}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('attendance_batches.delete.description', { ns: 'glossary' })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button variant="destructive" onClick={handleRemove} disabled={isPending}>
                            {t('attendance_batches.delete.confirm', { ns: 'glossary' })}
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

DeleteAttendanceBatchButon.displayName = 'DeleteAttendanceBatchButon';
