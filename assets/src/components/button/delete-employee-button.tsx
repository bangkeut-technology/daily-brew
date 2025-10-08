import React from 'react';
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
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { deleteEmployee } from '@/services/employee';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';

interface DeleteEmployeeButtonProps {
    employeePublicId: string;
    employeeName?: string;
    className?: string;
    variant?: 'ghost' | 'destructive' | 'outline' | 'secondary' | 'default' | null;
    size?: 'icon' | 'sm' | 'lg' | 'default' | null;
    onDeleted?: () => void; // e.g. refetch
}

export const DeleteEmployeeButton: React.FC<DeleteEmployeeButtonProps> = ({
    employeePublicId,
    employeeName,
    className,
    onDeleted,
    variant = 'ghost',
    size = 'icon',
}) => {
    const { t } = useTranslation();
    const [open, setOpen] = React.useState(false);
    const {mutate, isPending} = useMutation({
        mutationFn: deleteEmployee,
        onSuccess: (data) => {
            toast.success(data.message);
            setOpen(false);
            onDeleted?.();
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data.message : t('unknown_error', { ns: 'error' });
            toast.error(message);
        },
    });

    const onConfirm = React.useCallback(async () => {
        mutate(employeePublicId);
    }, []);

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    disabled={isPending}
                    className={className}
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
                        {t('employees.delete_title', { ns: 'glossary', name: employeeName ?? '' })}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('employees.delete_description', { ns: 'glossary', name: employeeName ?? '' })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isPending}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isPending ? t('deleting') : t('delete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
