import React from 'react';
import { BarChart3, CalendarCheck2, Clock4, MapPin, ShieldCheck, Sparkles, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { createFileRoute } from '@tanstack/react-router';
import { SiteHeader } from '@/components/site-header';
import { Hero } from '@/components/landing-page/hero';
import { SiteFooter } from '@/components/site-footer';

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

function TrustBar() {
    return (
        <section className="py-6">
            <div className="mx-auto max-w-5xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 place-items-center text-xs text-muted-foreground">
                {['Barista teams', 'Boutique cafés', 'Cloud kitchens', 'Food carts', 'Co-working', 'Retail'].map(
                    (label) => (
                        <span key={label} className="rounded-md border px-3 py-1">
                            {label}
                        </span>
                    ),
                )}
            </div>
        </section>
    );
}

function Features() {
    const items = [
        {
            icon: <BarChart3 className="h-5 w-5" />,
            title: 'KPI templates',
            desc: 'Reusable evaluation templates with criteria. Pro: custom weights & delegated graders.',
        },
        {
            icon: <Clock4 className="h-5 w-5" />,
            title: 'Attendance Gantt',
            desc: 'Month grid with per‑day statuses. Quick add, edit, and audit trail.',
        },
        {
            icon: <CalendarCheck2 className="h-5 w-5" />,
            title: 'Leave tracking',
            desc: 'Lightweight leave recording in Free. Pro adds approvals & quotas.',
        },
        {
            icon: <ShieldCheck className="h-5 w-5" />,
            title: 'Access & roles',
            desc: 'Invite helpers, set roles, and keep owners in control.',
        },
        {
            icon: <MapPin className="h-5 w-5" />,
            title: 'Geofence & IP (Pro · Coming soon)',
            desc: 'Restrict clock‑ins to your location or network with whitelists.',
        },
        {
            icon: <Wifi className="h-5 w-5" />,
            title: 'Multi‑store (Pro · Coming soon)',
            desc: 'Manage multiple stores with centralized reporting.',
        },
    ];
    return (
        <section id="features" className="py-10 md:py-14">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((f, i) => (
                    <Card key={i} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center gap-3 pb-2">
                            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center">
                                {f.icon}
                            </div>
                            <CardTitle className="text-lg">{f.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{f.desc}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}

function Showcase() {
    return (
        <section className="py-12 md:py-16">
            <div className="grid gap-6 md:grid-cols-2 md:items-center">
                <div>
                    <Badge className="mb-3" variant="secondary">
                        <Sparkles className="mr-1 h-4 w-4" />
                        Live preview
                    </Badge>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">See your month at a glance</h2>
                    <p className="mt-2 text-muted-foreground">
                        Our Gantt-style attendance grid keeps the whole team on one screen. Click a day to add a record,
                        or open details if it already exists.
                    </p>
                    <div className="mt-4 flex gap-2">
                        <Button asChild>
                            <a href="/console">Open Console</a>
                        </Button>
                        <Button variant="outline" asChild>
                            <a href="#pricing">Compare plans</a>
                        </Button>
                    </div>
                </div>
                <Card className="overflow-hidden">
                    <CardContent className="p-0">
                        <div className="bg-muted/30">
                            <div className="p-4 text-xs text-muted-foreground">Attendance · July</div>
                            <div className="overflow-x-auto">
                                <div className="min-w-[640px] divide-y">
                                    {/* Header row with days */}
                                    <div className="grid grid-cols-[160px_repeat(14,minmax(28px,1fr))] bg-card sticky top-0 z-10">
                                        <div className="px-3 py-2 border-r font-medium text-xs">Employee</div>
                                        {Array.from({ length: 14 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className="h-8 border-r grid place-items-center text-[10px] font-medium bg-muted"
                                            >
                                                {i + 1}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Employee rows */}
                                    {['Sovan', 'Chanthy', 'Mey'].map((name) => (
                                        <div key={name} className="grid grid-cols-[160px_repeat(14,minmax(28px,1fr))]">
                                            <div className="px-3 py-2 border-r bg-card sticky left-0">{name}</div>
                                            {Array.from({ length: 14 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="h-8 border-r grid place-items-center text-[10px]"
                                                >
                                                    {i % 5 === 0 ? (
                                                        <span className="px-1 rounded bg-green-500 text-white">P</span>
                                                    ) : i % 7 === 0 ? (
                                                        <span className="px-1 rounded bg-yellow-400 text-black">L</span>
                                                    ) : (
                                                        <span className="px-1 rounded bg-red-500 text-white">A</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}

function ProSection() {
    const perks = [
        {
            title: 'Custom weights',
            desc: 'Fine‑tune KPI weights per template.',
            icon: <BarChart3 className="h-4 w-4" />,
        },
        {
            title: 'Delegated evaluators',
            desc: 'Let trusted staff grade on your behalf.',
            icon: <ShieldCheck className="h-4 w-4" />,
        },
        {
            title: 'Geofence & IP',
            desc: 'Enforce location or network for clock‑ins.',
            icon: <MapPin className="h-4 w-4" />,
        },
        { title: 'Multi‑store', desc: 'One owner, many stores.', icon: <Wifi className="h-4 w-4" /> },
    ];
    return (
        <section className="py-14">
            <div className="text-center max-w-3xl mx-auto">
                <Badge variant="secondary" className="mb-2">
                    Pro extras · Coming soon
                </Badge>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Unlock advanced controls</h2>
                <p className="mt-2 text-muted-foreground">
                    Start free. Upgrade when you need IP lockdowns, geofencing, and deeper KPI control.
                </p>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {perks.map((p) => (
                    <Card key={p.title}>
                        <CardHeader className="flex flex-row items-center gap-2 pb-2">
                            <div className="h-8 w-8 grid place-items-center rounded-md bg-primary/10 text-primary">
                                {p.icon}
                            </div>
                            <CardTitle className="text-base">{p.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">{p.desc}</CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}

function Pricing() {
    return (
        <section id="pricing" className="py-16">
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Simple pricing</h2>
                <p className="mt-2 text-muted-foreground">
                    Start free. Upgrade when you need more stores, roles, and controls.
                </p>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
                {/* Free */}
                <Card className="relative">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Free</CardTitle>
                            <Badge variant="secondary">Great for starters</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="text-3xl font-bold">
                            $0<span className="text-base font-medium text-muted-foreground">/mo</span>
                        </div>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                            <li>1 store</li>
                            <li>Up to 10 employees</li>
                            <li>5 KPI templates</li>
                            <li>Attendance + leave (basic)</li>
                            <li>Owner‑only evaluations</li>
                        </ul>
                        <Button asChild className="w-full mt-3">
                            <a href="/signup">Get started</a>
                        </Button>
                    </CardContent>
                </Card>
                {/* Pro */}
                <Card className="relative border-primary/40">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Pro</CardTitle>
                            <Badge variant="secondary">Coming soon</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="text-3xl font-bold">Coming soon</div>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                            <li>Multiple stores</li>
                            <li>Unlimited employees & templates</li>
                            <li>Delegated evaluators & roles</li>
                            <li>Custom KPI weights</li>
                            <li>IP & Geofence clock‑ins</li>
                        </ul>
                        <Button disabled className="w-full mt-3" variant="outline">
                            Coming soon
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}

function FAQ() {
    return (
        <section id="faq" className="py-14">
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">FAQs</h2>
                <p className="mt-2 text-muted-foreground">Everything you need to know before brewing with us.</p>
            </div>
            <div className="mt-6 max-w-3xl mx-auto">
                <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                        <AccordionTrigger>What’s included in the free plan?</AccordionTrigger>
                        <AccordionContent>
                            One store, up to 10 employees, 5 KPI templates, basic attendance and leave. Owners can grade
                            KPIs.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>When do I need Pro?</AccordionTrigger>
                        <AccordionContent>
                            When you need multiple stores, delegated evaluators, custom weights, or to restrict
                            clock‑ins by IP/geofence.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>Can I migrate later?</AccordionTrigger>
                        <AccordionContent>Yes. You can upgrade anytime and your data stays intact.</AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </section>
    );
}
