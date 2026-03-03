import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Helmet } from 'react-helmet-async';
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

const DESCRIPTION =
    'DailyBrew is a simple HR tool for cafés and small restaurants. Track staff attendance, daily KPI scores, leave requests, and performance insights in one clean dashboard.';

function LandingPage() {
    return (
        <>
            <Helmet>
                <title>DailyBrew – Staff KPI & Attendance Tracker for Cafés</title>
                <meta name="description" content={DESCRIPTION} />
                <meta property="og:title" content="DailyBrew – Staff KPI & Attendance Tracker for Cafés" />
                <meta property="og:description" content={DESCRIPTION} />
                <meta property="og:url" content="https://dailybrew.work" />
                <meta property="og:type" content="website" />
                <link rel="canonical" href="https://dailybrew.work" />
            </Helmet>
            <main className="mx-auto max-w-7xl px-6 md:px-8">
                <Hero />
                <TrustBar />
                <Features />
                <Showcase />
                <ProSection />
                <Pricing />
                <FAQ />
            </main>
        </>
    );
}
