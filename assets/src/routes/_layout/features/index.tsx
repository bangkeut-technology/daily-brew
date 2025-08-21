import * as React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    ArrowRight,
    BarChart3,
    Building2,
    CalendarDays,
    CheckCircle2,
    ClipboardCheck,
    Coffee,
    Download,
    FileSpreadsheet,
    GaugeCircle,
    Lock,
    Users2,
    Wallet,
} from 'lucide-react';

export const Route = createFileRoute('/_layout/features/')({
    component: FeaturesPage,
});

function FeaturesPage() {
    return (
        <div className="min-h-dvh bg-background">
            {/* Hero */}
            <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="flex flex-col items-start gap-6 sm:gap-8">
                    <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
                        <Coffee className="h-3.5 w-3.5" />
                        Built for cafés & small teams
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                        Track attendance, evaluate KPIs, and prep payroll
                        <span className="text-primary"> — all in one place.</span>
                    </h1>
                    <p className="max-w-2xl text-muted-foreground">
                        DailyBrew keeps your team organized with simple daily workflows. Start free, upgrade when you’re
                        ready.
                    </p>
                    <div className="flex w-full flex-col sm:flex-row gap-2">
                        <Button asChild size="lg" className="w-full sm:w-auto">
                            <Link to="/console/sign-up">
                                Get started free <ArrowRight className="ml-1.5 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                            <Link to="/console/sign-in">Sign in</Link>
                        </Button>
                    </div>
                </div>
            </section>

            <Separator />

            {/* Core features grid */}
            <section id="features" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <h2 className="text-2xl md:text-3xl font-semibold">Core features</h2>
                <p className="mt-2 text-muted-foreground max-w-2xl">
                    Everything you need for daily operations—simple, fast, and reliable.
                </p>

                <div className="mt-6 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <FeatureCard
                        icon={<GaugeCircle className="h-5 w-5" />}
                        title="KPI Evaluations"
                        description="Score staff performance with templates and weights. Update anytime, keep a clean history."
                    />
                    <FeatureCard
                        icon={<Users2 className="h-5 w-5" />}
                        title="Employees"
                        description="Manage profiles, roles, and linked accounts. Quick access to details and recent scores."
                    />
                    <FeatureCard
                        icon={<CalendarDays className="h-5 w-5" />}
                        title="Attendance"
                        description="Fast daily input with a Gantt-style month view. Click any day to add or review."
                    />
                    <FeatureCard
                        icon={<ClipboardCheck className="h-5 w-5" />}
                        title="Leave Input"
                        description="Record upcoming leave (sick, annual, unpaid). No approval flow needed for single-user setup."
                    />
                    <FeatureCard
                        icon={<BarChart3 className="h-5 w-5" />}
                        title="Evaluation History"
                        description="Search, filter, and review results quickly. Open a side sheet for score details."
                    />
                    <FeatureCard
                        icon={<FileSpreadsheet className="h-5 w-5" />}
                        title="Templates & Criteria"
                        description="Create reusable KPI templates; share criteria across templates for consistency."
                    />
                </div>
            </section>

            {/* Pro features */}
            <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl md:text-3xl font-semibold">Pro features</h2>
                    <Badge variant="secondary" className="rounded-full">
                        Upgrade
                    </Badge>
                </div>
                <p className="mt-2 text-muted-foreground max-w-2xl">
                    Unlock reports and advanced insights when you’re ready to grow.
                </p>

                <div className="mt-6 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <FeatureCard
                        icon={<Download className="h-5 w-5" />}
                        title="Report Downloads"
                        description="Export KPI, attendance, and leave to CSV/PDF. Share with accountants or managers."
                        pro
                    />
                    <FeatureCard
                        icon={<BarChart3 className="h-5 w-5" />}
                        title="Analytics Dashboards"
                        description="Trends, comparisons, and outlier detection across teams or months."
                        pro
                    />
                    <FeatureCard
                        icon={<Building2 className="h-5 w-5" />}
                        title="Multi-branch"
                        description="Group employees and evaluations by branch; switch views in one click."
                        pro
                    />
                </div>
            </section>

            {/* Coming soon */}
            <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl md:text-3xl font-semibold">Coming soon</h2>
                    <Badge variant="outline" className="rounded-full">
                        Roadmap
                    </Badge>
                </div>
                <p className="mt-2 text-muted-foreground max-w-2xl">
                    Features in progress to simplify payroll and collaboration.
                </p>

                <div className="mt-6 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <FeatureCard
                        icon={<Wallet className="h-5 w-5" />}
                        title="Payroll"
                        description="Turn attendance + KPI into salary-ready data with bonuses and overtime."
                        soon
                    />
                    <FeatureCard
                        icon={<Lock className="h-5 w-5" />}
                        title="Role-based Access"
                        description="Invite managers or staff, assign granular permissions for actions."
                        soon
                    />
                    <FeatureCard
                        icon={<CheckCircle2 className="h-5 w-5" />}
                        title="Approvals"
                        description="Optional flows for leave, evaluations, and changes—at scale."
                        soon
                    />
                </div>
            </section>

            {/* CTA */}
            <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
                <Card className="overflow-hidden">
                    <CardContent className="p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div>
                            <h3 className="text-xl sm:text-2xl font-semibold">
                                Start with the free version—upgrade when you need reports.
                            </h3>
                            <p className="mt-2 text-muted-foreground max-w-xl">
                                No credit card required. Keep your team organized from day one.
                            </p>
                        </div>
                        <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2">
                            <Button asChild size="lg" className="w-full sm:w-auto">
                                <Link to="/console/sign-up">Create free account</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                                <Link to="/console/sign-in">Sign in</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description,
    pro,
    soon,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    pro?: boolean;
    soon?: boolean;
}) {
    return (
        <Card className="h-full">
            <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                        {icon}
                    </span>
                    {title}
                </CardTitle>
                {pro ? (
                    <Badge variant="secondary" className="rounded-full">
                        Pro
                    </Badge>
                ) : soon ? (
                    <Badge variant="outline" className="rounded-full">
                        Coming soon
                    </Badge>
                ) : null}
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{description}</CardContent>
        </Card>
    );
}
