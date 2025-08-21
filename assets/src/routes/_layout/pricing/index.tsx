import * as React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Check, Coffee } from 'lucide-react';

export const Route = createFileRoute('/_layout/pricing/')({
    component: PricingPage,
});

function PricingPage() {
    return (
        <div className="min-h-dvh bg-background">
            {/* Hero */}
            <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
                <div className="flex flex-col gap-4">
                    <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground w-fit">
                        <Coffee className="h-3.5 w-3.5" />
                        Built for cafés & small teams
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold leading-tight">Simple, transparent pricing.</h1>
                    <p className="max-w-2xl text-muted-foreground">
                        Start free. Upgrade when you need exports, multi-store, and advanced controls.
                    </p>
                    <div className="mt-2 flex w-full flex-col sm:flex-row gap-2">
                        <Button asChild size="lg" className="w-full sm:w-auto">
                            <Link to="/console/sign-up">Get started free</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                            <Link to="/console/sign-in">Sign in</Link>
                        </Button>
                    </div>
                </div>
            </section>

            <Separator />

            {/* Plans */}
            <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Starter (Free) */}
                    <PricingCard
                        title="Starter"
                        price="$0"
                        period="/month"
                        description="Everything you need to run day-to-day."
                        features={[
                            'Up to 10 employees',
                            'Up to 5 evaluation templates',
                            'KPI scoring (weighted criteria)',
                            'Attendance tracking',
                            'Leave input (no approvals)',
                            'On-screen history (view only)',
                            'Search & filters',
                            'No Store notion',
                            'No exports/downloads',
                        ]}
                        ctaLabel="Start free"
                        ctaTo="/console/sign-up"
                    />

                    {/* Pro (Coming soon) */}
                    <PricingCard
                        highlight
                        badge="Coming soon"
                        title="Pro"
                        price="$29"
                        period="/month"
                        description="Reporting & multi-store controls for growing cafés."
                        features={[
                            'Everything in Starter',
                            'Report downloads (CSV/PDF)',
                            'Multi-store (Store notion)',
                            'Custom weights per template',
                            'Roles & permissions; delegate evaluators',
                            'Employee ⇄ User linking',
                            'Attendance IP / geo restriction',
                        ]}
                        ctaLabel="Join waitlist"
                        ctaTo="/console/sign-in"
                        comingSoon
                    />

                    {/* Business (Later) */}
                    <PricingCard
                        badge="Roadmap"
                        title="Business"
                        price="Custom"
                        description="For chains & advanced workflows."
                        features={[
                            'Everything in Pro',
                            'Unlimited employees & branches',
                            'Advanced payroll & overtime',
                            'Integrations / API & scheduling',
                            'Priority support & onboarding',
                        ]}
                        ctaLabel="Contact us"
                        ctaTo="/console/sign-in"
                        secondary
                    />
                </div>
            </section>

            {/* Comparison */}
            <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
                <h2 className="text-2xl md:text-3xl font-semibold">What’s included</h2>
                <p className="mt-2 text-muted-foreground max-w-2xl">
                    Free covers daily ops. Pro adds exports & control. Business scales to multiple branches.
                </p>

                <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-left text-muted-foreground">
                            <tr className="border-b">
                                <th className="py-3 pr-4">Feature</th>
                                <th className="py-3 pr-4">Starter</th>
                                <th className="py-3 pr-4">Pro</th>
                                <th className="py-3 pr-0">Business</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                ['Employee limit', 'Up to 10', 'Up to 100', 'Unlimited'],
                                ['Evaluation templates', '5', 'Unlimited', 'Unlimited'],
                                ['KPI evaluations', 'Included', 'Included', 'Included'],
                                ['Custom weights per template', '—', 'Included', 'Included'],
                                ['Attendance tracking', 'Included', 'Included', 'Included'],
                                ['Leave input (no approvals)', 'Included', 'Included', 'Included'],
                                ['Store notion (multi-store)', '—', 'Included', 'Included'],
                                ['Report downloads (CSV/PDF)', '—', 'Included', 'Included'],
                                ['Roles & permissions', '—', 'Included', 'Included'],
                                ['IP/Geo restriction (attendance)', '—', 'Included', 'Included'],
                                ['Advanced payroll', '—', '—', 'Coming later'],
                                ['Integrations / API', '—', '—', 'Coming later'],
                            ].map(([label, s, p, b]) => (
                                <tr key={label} className="border-b last:border-b-0">
                                    <td className="py-3 pr-4">{label}</td>
                                    <td className="py-3 pr-4">{cellMark(s)}</td>
                                    <td className="py-3 pr-4">{cellMark(p)}</td>
                                    <td className="py-3 pr-0">{cellMark(b)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Final CTA */}
                <div className="mt-10">
                    <Card className="overflow-hidden">
                        <CardContent className="p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <div>
                                <h3 className="text-xl sm:text-2xl font-semibold">
                                    Start with Starter. Upgrade when you’re ready.
                                </h3>
                                <p className="mt-2 text-muted-foreground max-w-xl">
                                    No credit card for Starter. Pro is rolling out soon—join the waitlist.
                                </p>
                            </div>
                            <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2">
                                <Button asChild size="lg" className="w-full sm:w-auto">
                                    <Link to="/console/sign-up">Create free account</Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                                    <Link to="/console/sign-in">Join Pro waitlist</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
}

function PricingCard({
    highlight,
    badge,
    title,
    price,
    period,
    description,
    features,
    ctaLabel,
    ctaTo,
    secondary,
    comingSoon,
}: {
    highlight?: boolean;
    badge?: string;
    title: string;
    price: string;
    period?: string;
    description: string;
    features: string[];
    ctaLabel: string;
    ctaTo: string;
    secondary?: boolean;
    comingSoon?: boolean;
}) {
    return (
        <Card className={highlight ? 'border-primary shadow-lg ring-1 ring-primary/10' : ''}>
            <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{title}</CardTitle>
                    {badge ? (
                        <Badge variant={comingSoon ? 'outline' : 'secondary'} className="rounded-full">
                            {badge}
                        </Badge>
                    ) : null}
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{price}</span>
                    {period ? <span className="text-muted-foreground">{period}</span> : null}
                </div>
                <p className="text-sm text-muted-foreground">{description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
                <ul className="space-y-2">
                    {features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                            <Check className="h-4 w-4 mt-0.5 text-primary" />
                            <span className="text-sm">{f}</span>
                        </li>
                    ))}
                </ul>
                <Button asChild className="w-full" variant={secondary ? 'outline' : 'default'}>
                    <Link to={ctaTo}>{ctaLabel}</Link>
                </Button>
            </CardContent>
        </Card>
    );
}

function cellMark(value: string) {
    if (value === 'Included') {
        return (
            <span className="inline-flex items-center gap-1 text-foreground">
                <Check className="h-4 w-4 text-primary" />
                Included
            </span>
        );
    }
    if (value === '—' || value === 'Coming later') {
        return <span className="text-muted-foreground">{value}</span>;
    }
    return <span>{value}</span>;
}
