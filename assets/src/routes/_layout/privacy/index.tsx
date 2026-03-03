import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Helmet } from 'react-helmet-async';
import { Separator } from '@/components/ui/separator';
import { PrivacyContent } from '@/components/privacy-content';

export const Route = createFileRoute('/_layout/privacy/')({
    component: PrivacyPage,
});

function PrivacyPage() {
    return (
        <div className="min-h-dvh bg-background">
            <Helmet>
                <title>Privacy Policy — DailyBrew</title>
                <meta
                    name="description"
                    content="Read the DailyBrew Privacy Policy to understand how we collect, use, and protect your data."
                />
                <meta property="og:title" content="Privacy Policy — DailyBrew" />
                <meta
                    property="og:description"
                    content="Read the DailyBrew Privacy Policy to understand how we collect, use, and protect your data."
                />
                <meta property="og:url" content="https://dailybrew.work/privacy" />
                <link rel="canonical" href="https://dailybrew.work/privacy" />
            </Helmet>
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
