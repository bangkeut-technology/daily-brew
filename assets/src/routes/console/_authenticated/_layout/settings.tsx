import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchSettings, updateSettings } from '@/services/setting';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { SubmitSetting } from '@/types/setting';
import { yupResolver } from '@hookform/resolvers/yup';
import { settingSchema } from '@/schema/setting-schema';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { Form } from '@/components/ui/form';
import { TextField } from '@/components/field/text-field';
import { SelectField } from '@/components/field/select-field';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/console/_authenticated/_layout/settings')({
    component: SettingsPage,
});

function SettingsPage() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { data: settings, isSuccess } = useQuery({
        queryKey: ['settings'],
        queryFn: () => fetchSettings(),
    });
    const { mutate } = useMutation({
        mutationFn: updateSettings,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['settings'] }).then(() => {
                toast.success(data.message);
            });
        },
        onError: (error) => {
            const message = isAxiosError(error) ? error.response?.data?.message : t('occurred', { ns: 'error' });
            toast.error(message);
        },
    });
    const form = useForm<SubmitSetting>({
        resolver: yupResolver(settingSchema),
        defaultValues: {
            numberOfPaidLeave: settings?.number_of_paid_leave || '0',
            maximumLateCount: settings?.maximum_late_count || '3',
            paidLeaveCycle: settings?.paid_leave_cycle || 'monthly',
        },
    });
    React.useEffect(() => {
        if (isSuccess && settings) {
            form.reset({
                numberOfPaidLeave: settings?.number_of_paid_leave || '0',
                maximumLateCount: settings?.maximum_late_count || '3',
                paidLeaveCycle: settings?.paid_leave_cycle || 'monthly',
            });
        }
    }, [form, isSuccess, settings]);

    const onSubmit = React.useCallback(
        (data: SubmitSetting) => {
            mutate(data);
        },
        [mutate],
    );

    return (
        <div className="flex flex-col space-y-2 h-full">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-gray-600">Manage your account settings here.</p>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                    <TextField
                        control={form.control}
                        name="numberOfPaidLeave"
                        label={t('settings.number_of_paid_leave.label', { ns: 'glossary' })}
                        description={t('settings.number_of_paid_leave.description', { ns: 'glossary' })}
                    />
                    <SelectField
                        control={form.control}
                        name="paidLeaveCycle"
                        options={[
                            { label: t('monthly'), value: 'monthly' },
                            { label: t('yearly'), value: 'yearly' },
                        ]}
                        label={t('settings.paid_leave_cycle.label', { ns: 'glossary' })}
                        description={t('settings.paid_leave_cycle.description', { ns: 'glossary' })}
                    />
                    <TextField
                        control={form.control}
                        name="maximumLateCount"
                        label={t('settings.maximum_late_count.label', { ns: 'glossary' })}
                        description={t('settings.maximum_late_count.description', { ns: 'glossary' })}
                    />

                    <Button className="w-full">{t('save')}</Button>
                </form>
            </Form>
        </div>
    );
}
