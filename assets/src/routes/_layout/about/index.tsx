// routes/about.tsx
import * as React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Coffee,
    Target,
    HeartHandshake,
    GaugeCircle,
    Users2,
    CalendarDays,
    FileSpreadsheet,
    ChevronRight,
} from 'lucide-react';

export const Route = createFileRoute('/_layout/about/')({
    component: AboutPage,
    // meta: () => [{ title: "About — DailyBrew" }, { name: "description", content: "About DailyBrew: simple daily ops for cafés and small teams." }],
});

function AboutPage() {
    return (
        <div className="min-h-dvh bg-background">
            {/* Hero */}
            <section className="mx-auto max-w-6xl px-6 md:px-8 py-12 md:py-16">
                <div className="flex flex-col gap-4">
                    <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground w-fit">
                        <Coffee className="h-3.5 w-3.5" />
                        DailyBrew • Our story
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                        Brewing a calmer workday for cafés & small teams.
                    </h1>
                    <p className="max-w-2xl text-muted-foreground">
                        DailyBrew was created to make attendance, KPIs, and team coordination feel effortless—so owners
                        can focus on service, not spreadsheets.
                    </p>
                    <div className="flex w-full flex-col sm:flex-row gap-2 pt-2">
                        <Button asChild size="lg" className="w-full sm:w-auto">
                            <Link to="/sign-up">Get started free</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                            <Link to="/sign-in">Sign in</Link>
                        </Button>
                    </div>
                </div>
            </section>

            <Separator />

            {/* Mission & snapshot */}
            <section className="mx-auto max-w-6xl px-6 md:px-8 py-10 md:py-14 grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" /> Our mission
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">
                        We help small teams run smoothly with simple, reliable tools: attendance that takes seconds, KPI
                        scoring that makes sense, and history that’s always there when you need it. Start free, grow
                        when you’re ready.
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                            <HeartHandshake className="h-5 w-5 text-primary" /> What we value
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• Clarity over complexity</li>
                            <li>• Speed in daily workflows</li>
                            <li>• Data ownership & portability</li>
                            <li>• Thoughtful growth (not bloat)</li>
                        </ul>
                    </CardContent>
                </Card>
            </section>

            {/* What DailyBrew does */}
            <section className="mx-auto max-w-6xl px-6 md:px-8 py-10 md:py-14">
                <h2 className="text-2xl md:text-3xl font-semibold">What DailyBrew does</h2>
                <p className="text-muted-foreground mt-2 max-w-2xl">
                    The core features are designed for daily reality—quick updates, clear history, and minimal clicks.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Feature icon={<GaugeCircle className="h-5 w-5" />} title="KPI evaluations">
                        Weighted criteria with snapshots for history and audits.
                    </Feature>
                    <Feature icon={<Users2 className="h-5 w-5" />} title="Employees">
                        Roles, linked accounts (Pro), and clean profiles.
                    </Feature>
                    <Feature icon={<CalendarDays className="h-5 w-5" />} title="Attendance">
                        Gantt-style monthly view—click a day to add or review.
                    </Feature>
                    <Feature icon={<FileSpreadsheet className="h-5 w-5" />} title="Reports (Pro)">
                        CSV/PDF exports for accounting and sharing.
                    </Feature>
                    <Feature icon={<Coffee className="h-5 w-5" />} title="Multi-store (Pro)">
                        Group teams by store; switch context in a click.
                    </Feature>
                    <Feature icon={<Target className="h-5 w-5" />} title="Roadmap">
                        Approvals, role-based access, advanced payroll & APIs.
                    </Feature>
                </div>
            </section>

            <Separator />

            {/* Timeline */}
            <section className="mx-auto max-w-6xl px-6 md:px-8 py-10 md:py-14">
                <h2 className="text-2xl md:text-3xl font-semibold">Timeline</h2>
                <div className="mt-6 space-y-4">
                    <TimelineItem
                        date="Q3 2025"
                        title="Public beta"
                        text="KPI, attendance, leave input, evaluation history & search."
                    />
                    <TimelineItem
                        date="Q4 2025"
                        title="Pro early access"
                        text="Report downloads, multi-store, custom per-template weights."
                    />
                    <TimelineItem
                        date="2026"
                        title="Business & integrations"
                        text="Advanced payroll, APIs/integrations, scheduled reports."
                    />
                </div>
            </section>

            {/* CTA */}
            <section className="mx-auto max-w-6xl px-6 md:px-8 py-12 md:py-16">
                <Card className="overflow-hidden">
                    <CardContent className="p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <h3 className="text-xl md:text-2xl font-semibold">
                                Start free. Upgrade when you’re ready.
                            </h3>
                            <p className="mt-2 text-muted-foreground max-w-xl">
                                No credit card required for Starter. Your data stays yours.
                            </p>
                        </div>
                        <div className="flex w-full md:w-auto flex-col md:flex-row gap-2">
                            <Button asChild size="lg" className="w-full md:w-auto">
                                <Link to="/sign-up">Create free account</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="w-full md:w-auto">
                                <Link to="/sign-in">
                                    Sign in
                                    <ChevronRight className="ml-1.5 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}

function Feature({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
    return (
        <Card className="h-full">
            <CardHeader className="space-y-1">
                <CardTitle className="text-base md:text-lg flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                        {icon}
                    </span>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{children}</CardContent>
        </Card>
    );
}

function TimelineItem({ date, title, text }: { date: string; title: string; text: string }) {
    return (
        <div className="relative pl-6">
            <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-primary/80" />
            <div className="text-xs text-muted-foreground">{date}</div>
            <div className="font-medium">{title}</div>
            <div className="text-sm text-muted-foreground">{text}</div>
        </div>
    );
}
