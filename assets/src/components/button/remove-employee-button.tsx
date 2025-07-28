import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { deleteTemplateEmployees } from '@/services/evaluation-template';
import { useTranslation } from 'react-i18next';

interface RemoveEmployeeButtonProps {
    identifier: string;
    employeeIdentifier: string;
    onRemove?: () => void;
}

export const RemoveEmployeeButton: React.FunctionComponent<RemoveEmployeeButtonProps> = ({
    identifier,
    employeeIdentifier,
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

    const handleRemove = () => {
        mutate({ identifier, employeeIdentifier });
    };

    return (
        <Button variant="destructive" size="icon" onClick={handleRemove} disabled={isPending}>
            <Trash2 className="h-4 w-4" />
        </Button>
    );
};

RemoveEmployeeButton.displayName = 'RemoveEmployeeButton';
