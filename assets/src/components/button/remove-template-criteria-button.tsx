import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { deleteTemplateCriteria } from '@/services/evaluation-template-criteria';
import { useTranslation } from 'react-i18next';

interface RemoveTemplateCriteriaButtonProps {
    identifier: string;
}

export const RemoveTemplateCriteriaButton: React.FunctionComponent<RemoveTemplateCriteriaButtonProps> = ({
    identifier,
}) => {
    const { t } = useTranslation();
    const { mutate, isPending } = useMutation({
        mutationFn: deleteTemplateCriteria,
        onSuccess: (data) => {
            toast.success(data.message);
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data.message : t('occurred', { ns: 'error' });
            toast.error(message);
        },
    });

    const handleRemove = () => {
        mutate(identifier);
    };

    return (
        <Button variant="destructive" size="icon" onClick={handleRemove} disabled={isPending}>
            <Trash2 className="h-4 w-4" />
        </Button>
    );
};

RemoveTemplateCriteriaButton.displayName = 'RemoveCriteriaButton';
