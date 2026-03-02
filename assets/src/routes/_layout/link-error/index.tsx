import React from 'react';
import { createFileRoute, Link, useSearch } from '@tanstack/react-router';
import { z } from 'zod';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ShieldAlert } from 'lucide-react';

export const Route = createFileRoute('/_layout/link-error/')({
    component: MagicSignInInvalidPage,
    validateSearch: z.object({
        reason: z.enum(['expired', 'invalid']).optional().default('invalid'),
    }),
});

type Reason = 'expired' | 'invalid';

const COPY: Record<
    Reason,
    {
        title: string;
        description: string;
        icon: React.ReactNode;
    }
> = {
    expired: {
        title: 'Your sign-in link has expired',
        description: 'For security reasons, sign-in links are only valid for a short time.',
        icon: <Clock className="h-6 w-6 text-muted-foreground" />,
    },
    invalid: {
        title: 'This sign-in link can’t be used',
        description: 'It may have already been used or replaced by a newer link.',
        icon: <ShieldAlert className="h-6 w-6 text-muted-foreground" />,
    },
};

function MagicSignInInvalidPage() {
    const search = useSearch({ strict: false });
    const reason = (search.reason as Reason) ?? 'invalid';

    const content = COPY[reason];

    return (
        <div className="flex min-h-[calc(85vh-64px)] items-center justify-center px-4">
            <Card className="w-full max-w-105">
                <CardHeader className="flex flex-col items-center gap-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        {content.icon}
                    </div>
                    <h1 className="text-lg font-semibold">{content.title}</h1>
                </CardHeader>

                <CardContent className="text-center text-sm text-muted-foreground">
                    <p>{content.description}</p>
                    <p className="mt-2 text-xs">This helps keep your account secure.</p>
                </CardContent>

                <CardFooter className="flex flex-col gap-3">
                    <Button asChild className="w-full">
                        <Link to="/sign-in">Request a new sign-in link</Link>
                    </Button>

                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/">Back to Adora Analytics</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
