import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link, ShieldCheck, Unlink } from 'lucide-react';
import { AppleIcon } from '@/components/icons/apple-icon';
import { GoogleIcon } from '@/components/icons/google-icon';
import { createFileRoute } from '@tanstack/react-router';
import { useAuthenticationDispatch, useAuthenticationState } from '@/hooks/use-authentication';
import { useMutation } from '@tanstack/react-query';
import { disconnectOAuth } from '@/services/user';
import { Provider, ProviderKey } from '@/types/oauth';
import { toast } from 'sonner';
import { errorHandler } from '@/lib/utils';

const PROVIDERS: Provider[] = [
    { key: 'apple', name: 'Apple', icon: <AppleIcon className="h-5 w-5" />, hide: false },
    { key: 'google', name: 'Google', icon: <GoogleIcon className="h-5 w-5" />, hide: false },
];

export const Route = createFileRoute('/console/_authenticated/_layout/profile/_layout/connections/')({
    component: ConnectionsPage,
});

function ConnectionsPage() {
    const { user } = useAuthenticationState();
    const dispatch = useAuthenticationDispatch();
    const [provider, setProvider] = React.useState<ProviderKey>();
    const { mutate, isPending } = useMutation({
        mutationFn: disconnectOAuth,
        onSuccess: (data) => {
            toast.success(data.message);
            setProvider(undefined);
            dispatch({ type: 'UPDATE_USER', user: data.user });
        },
        onError: errorHandler,
    });

    if (!user) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Sign-in connections
                </CardTitle>
                <CardDescription>
                    Manage how you sign in to your account. You can connect multiple providers for backup access.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {PROVIDERS.map((p, index) => {
                    if (p.hide) return null;
                    const isConnected = user.authentications[p.key];
                    return (
                        <React.Fragment key={p.key}>
                            <div className="flex items-center justify-between gap-4">
                                {/* Left */}
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full border bg-muted">
                                        {p.icon}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">{p.name}</span>
                                        {user.authentications[p.key] ? (
                                            <Badge variant="secondary">Connected</Badge>
                                        ) : (
                                            <Badge variant="outline">Not connected</Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Right */}
                                {isConnected ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                        disabled={isPending}
                                        onClick={() => {
                                            setProvider(p.key);
                                            mutate(p.key);
                                        }}
                                    >
                                        <Unlink className="h-4 w-4" />
                                        {isPending && provider === p.key ? 'Disconnecting...' : 'Disconnect'}
                                    </Button>
                                ) : (
                                    <Button size="sm" className="gap-2" disabled={isPending} asChild>
                                        <a href={`/oauth/connect/${p.key}`}>
                                            <Link className="h-4 w-4" />
                                            Connect
                                        </a>
                                    </Button>
                                )}
                            </div>

                            {index < PROVIDERS.length - 1 && <Separator />}
                        </React.Fragment>
                    );
                })}
            </CardContent>
        </Card>
    );
}
