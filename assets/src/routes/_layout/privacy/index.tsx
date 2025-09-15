import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Separator } from '@/components/ui/separator';
import { PrivacyContent } from '@/components/privacy-content';

export const Route = createFileRoute('/_layout/privacy/')({
    component: PrivacyPage,
});

function PrivacyPage() {
    return (
        <div className="min-h-dvh bg-background">
            <section className="mx-auto max-w-5xl px-6 md:px-8 py-10 md:py-16">
                <div className="space-y-3">
                    <h1 className="text-3xl md:text-5xl font-bold leading-tight">Privacy Policy</h1>
                    <p className="text-muted-foreground">
                        Last updated: <strong>August 22, 2025</strong>
                    </p>
                </div>
            </section>

            <Separator />

            <PrivacyContent />
        </div>
    );
}
