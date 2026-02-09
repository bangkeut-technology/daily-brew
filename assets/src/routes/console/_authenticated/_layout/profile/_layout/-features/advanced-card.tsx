import React from 'react';
import { User } from '@/types/user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type AdvancedCardProps = {
    user: User;
};

export const AdvancedCard: React.FunctionComponent<AdvancedCardProps> = ({ user }) => {
    return (
        <Card className="opacity-80">
            <CardHeader>
                <CardTitle>Advanced</CardTitle>
                <CardDescription>Internal identifiers</CardDescription>
            </CardHeader>

            <CardContent className="space-y-2">
                <div className="text-xs text-muted-foreground">Public ID</div>

                <code className="text-xs rounded bg-muted px-2 py-1">{user.publicId}</code>
            </CardContent>
        </Card>
    );
};

AdvancedCard.displayName = 'AdvancedCard';
