import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Hero } from '@/routes/-landing-page/hero';
import { TrustBar } from '@/routes/-landing-page/trust-bar';
import { Features } from '@/routes/-landing-page/features';
import { Showcase } from '@/routes/-landing-page/showcase';
import { ProSection } from '@/routes/-landing-page/pro-section';
import { Pricing } from '@/routes/-landing-page/pricing';
import { FAQ } from '@/routes/-landing-page/faq';

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
