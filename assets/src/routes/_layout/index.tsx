import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Hero } from '@/routes/_layout/-components/hero';
import { TrustBar } from '@/routes/_layout/-components/trust-bar';
import { Features } from '@/routes/_layout/-components/features';
import { Showcase } from '@/routes/_layout/-components/showcase';
import { ProSection } from '@/routes/_layout/-components/pro-section';
import { Pricing } from '@/routes/_layout/-components/pricing';
import { FAQ } from '@/routes/_layout/-components/faq';

export const Route = createFileRoute('/_layout/')({
    component: LandingPage,
});

function LandingPage() {
    return (
        <main className="mx-auto max-w-7xl px-6 md:px-8">
            <Hero />
            <TrustBar />
            <Features />
            <Showcase />
            <ProSection />
            <Pricing />
            <FAQ />
        </main>
    );
}
