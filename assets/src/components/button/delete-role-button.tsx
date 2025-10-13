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
import { deleteRole } from '@/services/role';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { Role } from '@/types/role';

interface DeleteRoleButtonProps {
    role: Role;
    className?: string;
    variant?: 'ghost' | 'destructive' | 'outline' | 'secondary' | 'default' | null;
    size?: 'icon' | 'sm' | 'lg' | 'default' | null;
    onDeleted?: () => void;
}

export const DeleteRoleButton: React.FC<DeleteRoleButtonProps> = ({
    role,
    className,
    onDeleted,
    variant = 'ghost',
    size = 'icon',
}) => {
    const { t } = useTranslation();
    const [open, setOpen] = React.useState(false);
    const { mutate, isPending } = useMutation({
        mutationFn: deleteRole,
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
        mutate(role.publicId);
    }, [mutate, role.publicId]);

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    disabled={isPending}
                    className={className}
                    variant={variant ?? 'ghost'}
                    size={size ?? 'icon'}
                    aria-label={t('roles.delete.button', { ns: 'glossary' })}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {t('roles.delete.title', { ns: 'glossary', name: role.name ?? '' })}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('roles.delete.description', { ns: 'glossary', name: role.name ?? '' })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} disabled={isPending} className="bg-red-600 hover:bg-red-700">
                        {isPending ? t('deleting') : t('delete')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
