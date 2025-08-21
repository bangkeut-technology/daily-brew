import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Hero } from '@/routes/-components/hero';
import { TrustBar } from '@/routes/-components/trust-bar';
import { Features } from '@/routes/-components/features';
import { Showcase } from '@/routes/-components/showcase';
import { ProSection } from '@/routes/-components/pro-section';
import { Pricing } from '@/routes/-components/pricing';
import { FAQ } from '@/routes/-components/faq';

export const Route = createFileRoute('/')({
    component: LandingPage,
});

function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <SiteHeader />
            <main className="mx-auto max-w-7xl px-6 md:px-8">
                <Hero />
                <TrustBar />
                <Features />
                <Showcase />
                <ProSection />
                <Pricing />
                <FAQ />
            </main>
            <SiteFooter />
        </div>
    );
}
