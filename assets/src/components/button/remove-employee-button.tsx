import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { deleteTemplateEmployees } from '@/services/evaluation-template';
import { useTranslation } from 'react-i18next';
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

interface RemoveEmployeeButtonProps {
    publicId: string;
    employeePublicId: string;
    withText?: boolean;
    onRemove?: () => void;
}

export const RemoveEmployeeButton: React.FunctionComponent<RemoveEmployeeButtonProps> = ({
    publicId,
    employeePublicId,
    withText,
    onRemove,
}) => {
    const { t } = useTranslation();
    const { mutate, isPending } = useMutation({
        mutationFn: deleteTemplateEmployees,
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
        mutate({ publicId, employeePublicId });
    }, [mutate, publicId, employeePublicId]);

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size={withText ? 'default' : 'icon'} disabled={isPending}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('employees.remove.title', { ns: 'glossary' })}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('employees.remove.description', { ns: 'glossary' })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button variant="destructive" onClick={handleRemove} disabled={isPending}>
                            {t('employees.remove.confirm', { ns: 'glossary' })}
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

RemoveEmployeeButton.displayName = 'RemoveEmployeeButton';
