import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useAuthenticationState } from '@/hooks/use-authentication';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Lock, LogOut, ShieldCheck } from 'lucide-react';
import { DeleteButton } from '@/routes/console/_authenticated/_layout/profile/_layout/security/-components/delete-button';
import { PasswordDialog } from '@/routes/console/_authenticated/_layout/profile/_layout/security/-components/password-dialog';

export const Route = createFileRoute('/console/_authenticated/_layout/profile/_layout/security/')({
    component: SecurityPage,
});

function SecurityPage() {
    const { user } = useAuthenticationState();

    if (!user) return null;

    const hasPassword = Boolean(user.authentications?.password);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Account security
                </CardTitle>
                <CardDescription>Authentication methods and irreversible account actions</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Password */}
                <section className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Password</p>
                                <p className="text-xs text-muted-foreground">
                                    {hasPassword ? 'You can sign in using your password' : 'No password set'}
                                </p>
                            </div>
                        </div>
                        <PasswordDialog hasPassword={hasPassword} />
                    </div>
                </section>

                <Separator />

                {/* Danger zone */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <p className="text-sm font-medium">Danger zone</p>
                    </div>

                    {/* Logout all */}
                    <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
                        <p className="text-xs text-muted-foreground">Sign out from all devices</p>

                        <Button variant="destructive" size="sm">
                            <LogOut className="mr-1 h-3 w-3" />
                            Logout all
                        </Button>
                    </div>

                    {/* Delete account */}
                    <div className="flex items-center justify-between rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2">
                        <div className="space-y-0.5">
                            <p className="text-xs font-medium text-destructive">Delete account</p>
                            <p className="text-xs text-muted-foreground">
                                Permanently remove your account and all data
                            </p>
                        </div>

                        <DeleteButton />
                    </div>
                </section>
            </CardContent>
        </Card>
    );
}
