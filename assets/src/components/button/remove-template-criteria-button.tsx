import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { deleteTemplateCriteria } from '@/services/evaluation-template-criteria';
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

interface RemoveTemplateCriteriaButtonProps {
    publicId: string;
    withText?: boolean;
    title: string;
    description: string;
    confirmationText: string;
    onRemove?: () => void;
}

export const RemoveTemplateCriteriaButton: React.FunctionComponent<RemoveTemplateCriteriaButtonProps> = ({
    publicId,
    title,
    description,
    confirmationText,
    withText,
    onRemove,
}) => {
    const { t } = useTranslation();
    const { mutate, isPending } = useMutation({
        mutationFn: deleteTemplateCriteria,
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
        mutate(publicId);
    }, [mutate, publicId]);

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size={withText ? 'default' : 'icon'} disabled={isPending}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button variant="destructive" onClick={handleRemove} disabled={isPending}>
                            {confirmationText}
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

RemoveTemplateCriteriaButton.displayName = 'RemoveCriteriaButton';
