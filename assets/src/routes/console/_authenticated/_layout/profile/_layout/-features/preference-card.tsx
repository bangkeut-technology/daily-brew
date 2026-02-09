import React from 'react';
import { User } from '@/types/user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation } from '@tanstack/react-query';
import { patchLocale } from '@/services/user';
import i18next from '@/i18next';
import { toast } from 'sonner';
import { errorHandler } from '@/lib/utils';

type PreferenceCardProps = {
    user: User;
};

export const PreferencesCard: React.FunctionComponent<PreferenceCardProps> = ({ user }) => {
    const { mutate } = useMutation({
        mutationFn: patchLocale,
        onSuccess: (data) => {
            const { message, user } = data;
            i18next.changeLanguage(user.locale).then(() => toast.success(message));
        },
        onError: errorHandler,
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Language and regional settings</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Language</label>

                    <Select defaultValue={user.locale} onValueChange={(locale) => mutate({ locale })}>
                        <SelectTrigger className="w-50">
                            <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="km">ភាសាខ្មែរ</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
};

PreferencesCard.displayName = 'PreferencesCard';
