// routes/(marketing)/faq.tsx
import * as React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Coffee, HelpCircle } from 'lucide-react';

export const Route = createFileRoute('/faq/')({
    component: FAQPage,
    // meta: () => [{ title: "FAQ — DailyBrew" }, { name: "description", content: "Frequently asked questions about DailyBrew." }],
});

function FAQPage() {
    return (
        <div className="min-h-dvh bg-background">
            {/* Hero */}
            <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
                <div className="flex flex-col gap-3">
                    <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground w-fit">
                        <Coffee className="h-3.5 w-3.5" />
                        DailyBrew • Help center
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold leading-tight">Frequently asked questions</h1>
                    <p className="max-w-2xl text-muted-foreground">
                        Answers to common questions about features, pricing, and using DailyBrew.
                    </p>
                    <div className="mt-2 flex w-full flex-col sm:flex-row gap-2">
                        <Button asChild size="lg" className="w-full sm:w-auto">
                            <Link to="/console/sign-up">Create free account</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                            <Link to="/console/sign-in">Sign in</Link>
                        </Button>
                    </div>
                </div>
            </section>

            <Separator />

            {/* FAQ Accordion */}
            <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                <Accordion type="single" collapsible className="w-full">
                    <QA id="what-is" q="What is DailyBrew?">
                        DailyBrew helps cafés and small teams manage employees, track attendance, run KPI evaluations,
                        and prepare payroll-ready data — starting free, with optional paid upgrades.
                    </QA>

                    <QA id="free-plan" q="What do I get on the Free plan?">
                        You can add employees, track attendance and leave inputs, run basic KPI evaluations, and view
                        recent history in-app. Searching and filtering are included to keep things simple.
                    </QA>

                    <QA id="pro-plan" q="What’s included in Pro?">
                        Pro unlocks report downloads (CSV/PDF), unlimited history, analytics dashboards, and custom
                        evaluation templates. It’s perfect when you need to share or archive data.
                    </QA>

                    <QA id="business-plan" q="Who is the Business plan for?">
                        Growing teams and multi-branch companies. You get everything in Pro plus multi-branch
                        management, upcoming advanced payroll, API/integrations (coming soon), and priority support.
                    </QA>

                    <QA id="employees-limit" q="Is there a limit on employees?">
                        Starter supports up to 10 employees, Pro scales to ~100, and Business can be unlimited. You can
                        upgrade anytime as you grow.
                    </QA>

                    <QA id="attendance" q="How does attendance work?">
                        Use a fast, Gantt-style monthly view. Click any day to add or review an entry. Advanced options
                        (geo/IP restrictions and shift rules) will be in paid tiers.
                    </QA>

                    <QA id="leave" q="Is there a leave request workflow?">
                        In Starter, it’s a simple “Leave Input” (admin enters upcoming leave). Approval workflows and
                        balances will be part of future paid enhancements.
                    </QA>

                    <QA id="kpi" q="How do KPI evaluations work?">
                        Create templates with criteria and weights, then score employees by day. We compute weighted
                        averages and store a snapshot for history and reporting.
                    </QA>

                    <QA id="exports" q="Can I export reports?">
                        Exports are a Pro/Business feature. Download KPI, attendance, and leave reports in CSV/PDF for
                        accounting or sharing.
                    </QA>

                    <QA id="security" q="Do I keep ownership of my data?">
                        Yes. Your data is yours. You can export on paid plans, and if you cancel, we keep your account
                        in read-only for a period so you can retrieve information.
                    </QA>

                    <QA id="pricing" q="How much does it cost?">
                        Starter is free. Pro starts around $29/month, and Business is custom depending on needs and
                        branches. We also offer annual discounts.
                    </QA>

                    <QA id="cancel" q="Can I cancel anytime?">
                        Absolutely. Plans are month-to-month. Cancellation is effective at the end of your billing
                        cycle.
                    </QA>

                    <QA id="roadmap" q="What’s coming next?">
                        Advanced payroll, role-based access, approvals, and integrations are on our roadmap. These will
                        roll out to paid tiers first.
                    </QA>
                </Accordion>

                {/* Contact/help card */}
                <Card className="mt-8">
                    <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                                <div className="font-semibold">Still have questions?</div>
                                <p className="text-sm text-muted-foreground">
                                    Reach out and we’ll help you get set up in minutes.
                                </p>
                            </div>
                        </div>
                        <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2">
                            <Button asChild variant="outline" className="w-full sm:w-auto">
                                <Link to="/console/sign-in">Contact support</Link>
                            </Button>
                            <Button asChild className="w-full sm:w-auto">
                                <Link to="/console/sign-up">Start free</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}

function QA({ id, q, children }: { id: string; q: string; children: React.ReactNode }) {
    return (
        <AccordionItem value={id}>
            <AccordionTrigger className="text-left">{q}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">{children}</AccordionContent>
        </AccordionItem>
    );
}
