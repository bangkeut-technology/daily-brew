import React from 'react';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { deleteEmployee } from '@/services/employee';
import { isAxiosError } from 'axios';

interface DeleteEmployeeButtonProps {
    employeePublicId: string;
    employeeName?: string;
    onDeleted?: () => void; // e.g. refetch
    variant?: 'ghost' | 'destructive' | 'outline' | 'secondary' | 'default' | null;
    size?: 'icon' | 'sm' | 'lg' | 'default' | null;
}

export const DeleteEmployeeButton: React.FC<DeleteEmployeeButtonProps> = ({
    employeePublicId,
    employeeName,
    onDeleted,
    variant = 'ghost',
    size = 'icon',
}) => {
    const { t } = useTranslation(['glossary', 'common']);
    const [open, setOpen] = React.useState(false);
    const {} = useMutation({
        mutationFn: () => deleteEmployee(employeePublicId),
        onSuccess: () => {
            setOpen(false);
            onDeleted?.();
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.
            toast.error(error?.message ?? t('common.unknown_error', { ns: 'common' }));
        },
    });

    const onConfirm = async () => {
        try {
            setSubmitting(true);
            setError(null);
            await deleteEmployee(employeePublicId);
            setOpen(false);
            onDeleted?.();
        } catch (e: any) {
            setError(e?.message ?? t('common.unknown_error', { ns: 'common' }));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant={variant ?? 'ghost'}
                    size={size ?? 'icon'}
                    aria-label={t('employees.delete', { ns: 'glossary' })}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {t('employees.delete.title', { ns: 'glossary', name: employeeName ?? '' })}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('employees.delete.description', { ns: 'glossary', name: employeeName ?? '' })}
                    </AlertDialogDescription>
                    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={submitting}>{t('common.cancel', { ns: 'common' })}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={submitting}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {submitting ? t('common.deleting', { ns: 'common' }) : t('common.delete', { ns: 'common' })}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
