import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/faq/')({
    component: FeaturePage,
});

const ACCENT = '#FF5200'; // falls back to user's known brand color

function IconByName({ name, className = 'w-6 h-6' }: { name?: string; className?: string }) {
    const Fallback = (Icons as any)['HelpCircle'];
    if (!name) return <Fallback className={className} />;
    const Icon = (Icons as any)[name] || Fallback;
    return <Icon className={className} />;
}

type Feature = {
    title: string;
    description: string;
    icon?: string; // lucide-react icon name
    pill?: string; // small label e.g., "New", "Beta"
};

type CTA = {
    label: string;
    sublabel?: string;
    primaryText: string;
    primaryHref?: string;
    secondaryText?: string;
    secondaryHref?: string;
};

type FeaturePageProps = {
    brand?: {
        name?: string;
        accentHex?: string; // overrides ACCENT
        logoUrl?: string;
    };
    hero: {
        eyebrow?: string;
        title: string;
        subtitle?: string;
        bullets?: string[];
    };
    features: Feature[];
    search?: {
        placeholder?: string;
        onSearch?: (term: string) => void; // not wired in demo; plug into app state/router
    };
    whatsNew?: {
        items: Array<{ date: string; title: string; body?: string; tag?: string }>;
    };
    cta?: CTA;
    faq?: Array<{ q: string; a: string }>;
};

function FeaturePage({ brand, hero, features, search, whatsNew, cta, faq }: FeaturePageProps) {
    const accent = brand?.accentHex || ACCENT;

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100">
            {/* Hero */}
            <section className="relative px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        {brand?.logoUrl && (
                            <img
                                src={brand.logoUrl}
                                alt={brand?.name || 'Brand'}
                                className="h-10 w-10 rounded-xl shadow"
                            />
                        )}
                        {brand?.name && (
                            <span className="text-lg font-semibold tracking-tight" style={{ color: accent }}>
                                {brand.name}
                            </span>
                        )}
                    </div>

                    {hero.eyebrow && (
                        <Badge className="mb-4" style={{ backgroundColor: accent, borderColor: accent }}>
                            {hero.eyebrow}
                        </Badge>
                    )}

                    <motion.h1
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight"
                    >
                        {hero.title}
                    </motion.h1>

                    {hero.subtitle && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.4 }}
                            className="mt-3 max-w-3xl text-base sm:text-lg text-slate-600 dark:text-slate-300"
                        >
                            {hero.subtitle}
                        </motion.p>
                    )}

                    {hero.bullets && hero.bullets.length > 0 && (
                        <ul className="mt-6 grid gap-2 sm:grid-cols-2 max-w-3xl">
                            {hero.bullets.map((b, i) => (
                                <li key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-200">
                                    <span
                                        className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full"
                                        style={{ backgroundColor: accent }}
                                    >
                                        <Icons.Check className="h-3.5 w-3.5 text-white" />
                                    </span>
                                    <span>{b}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Optional Search */}
                    {search && (
                        <div className="mt-8 max-w-xl">
                            <div className="flex gap-2">
                                <Input placeholder={search.placeholder || 'Search features…'} className="h-11" />
                                <Button className="h-11" style={{ backgroundColor: accent, borderColor: accent }}>
                                    <Icons.Search className="mr-2 h-4 w-4" /> Search
                                </Button>
                            </div>
                            <p className="mt-2 text-xs text-slate-500">
                                Tip: connect this to your router to sync URL params.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* Feature Grid */}
            <section className="px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 lg:pb-16">
                <div className="max-w-6xl mx-auto">
                    <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 8 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.35, delay: i * 0.04 }}
                            >
                                <Card className="rounded-2xl shadow-sm hover:shadow-md transition-shadow h-full">
                                    <CardHeader className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="inline-flex items-center justify-center rounded-xl border p-2"
                                                style={{ borderColor: accent }}
                                            >
                                                <IconByName name={f.icon} className="w-5 h-5" />
                                            </div>
                                            <CardTitle className="text-lg font-semibold tracking-tight">
                                                {f.title}
                                            </CardTitle>
                                            {f.pill && (
                                                <Badge variant="secondary" className="ml-auto">
                                                    {f.pill}
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                            {f.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What's New / Changelog */}
            {whatsNew && whatsNew.items?.length > 0 && (
                <section className="px-4 sm:px-6 lg:px-8 py-8">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center gap-2 mb-4">
                            <Icons.Sparkles className="h-5 w-5" />
                            <h2 className="text-xl font-semibold">What’s New</h2>
                        </div>
                        <ol className="relative border-l pl-6 space-y-6 border-slate-200 dark:border-slate-700">
                            {whatsNew.items.map((item, i) => (
                                <li key={i} className="ml-2">
                                    <span
                                        className="absolute -left-2 mt-1 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-900"
                                        style={{ backgroundColor: accent }}
                                    />
                                    <div className="flex items-center gap-3 text-xs text-slate-500">
                                        <span>{item.date}</span>
                                        {item.tag && <Badge variant="outline">{item.tag}</Badge>}
                                    </div>
                                    <h3 className="mt-1 font-medium">{item.title}</h3>
                                    {item.body && (
                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.body}</p>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>
            )}

            {/* FAQ */}
            {faq && faq.length > 0 && (
                <section className="px-4 sm:px-6 lg:px-8 py-10">
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-6 flex items-center gap-2">
                            <Icons.MessageCircleQuestion className="h-5 w-5" />
                            <h2 className="text-xl font-semibold">FAQ</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {faq.map((item, i) => (
                                <Card key={i} className="rounded-2xl">
                                    <CardHeader>
                                        <CardTitle className="text-base">{item.q}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                            {item.a}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA */}
            {cta && (
                <section className="px-4 sm:px-6 lg:px-8 py-12">
                    <div className="max-w-6xl mx-auto">
                        <div
                            className="relative overflow-hidden rounded-3xl p-8 sm:p-12 border"
                            style={{ borderColor: accent }}
                        >
                            <div
                                className="absolute inset-0 opacity-5"
                                style={{
                                    background: `radial-gradient(600px 200px at 10% 10%, ${accent}, transparent)`,
                                }}
                            />
                            <div className="relative grid lg:grid-cols-2 gap-6 items-center">
                                <div>
                                    <h3 className="text-2xl font-bold tracking-tight">{cta.label}</h3>
                                    {cta.sublabel && (
                                        <p className="mt-2 text-slate-600 dark:text-slate-300">{cta.sublabel}</p>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-3 lg:justify-end">
                                    {cta.primaryText && (
                                        <Button
                                            asChild
                                            className="font-medium"
                                            style={{ backgroundColor: accent, borderColor: accent }}
                                        >
                                            <a href={cta.primaryHref || '#'}>{cta.primaryText}</a>
                                        </Button>
                                    )}
                                    {cta.secondaryText && (
                                        <Button asChild variant="outline" className="font-medium">
                                            <a href={cta.secondaryHref || '#'}>{cta.secondaryText}</a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <footer className="px-4 sm:px-6 lg:px-8 pb-12 text-center text-xs text-slate-500">
                Built with ❤ — Feature Page
            </footer>
        </div>
    );
}

/** Demo with sensible defaults; swap the data to reuse across products (BillAndGo, Adora, NeatFix, etc.) */
export default function DemoFeaturePage() {
    const data: FeaturePageProps = {
        brand: { name: 'BillAndGo', accentHex: ACCENT },
        hero: {
            eyebrow: 'All-in-one POS',
            title: 'Run your cafe with clarity: POS, KPI, and payroll—without the clutter.',
            subtitle:
                'BillAndGo is a modern, mobile-first POS that helps you track orders, measure performance, and grow your business. Simple to start, powerful as you scale.',
            bullets: [
                'Mobile-ready UI that fits any screen',
                'ABA PayWay integration (subscriptions & payments)',
                'Flexible roles: Admin, Cashier, Waiter',
                'Multi-currency: USD & KHR (Riel) support',
            ],
        },
        search: {
            placeholder: 'Search features (e.g., receipts, shifts, coupons)…',
        },
        features: [
            {
                title: 'Lightning Checkout',
                description: 'Scan, charge, and print receipts in seconds with smart defaults and offline-friendly UX.',
                icon: 'Zap',
            },
            {
                title: 'Shift & Attendance',
                description: 'Track staff shifts, attendance, and daily KPIs in one console screen.',
                icon: 'CalendarCheck2',
            },
            {
                title: 'Kitchen & Order Flow',
                description: 'Structured workflow from draft → pending → confirmed → preparing → delivery → completed.',
                icon: 'Workflow',
            },
            {
                title: 'Coupons & Promotions',
                description: 'Create promo codes and automatic discounts—scheduled, stackable, or one-time.',
                icon: 'TicketPercent',
                pill: 'New',
            },
            {
                title: 'Dual Currency',
                description: 'Accept USD & KHR, auto-convert small USD change to Riel, and record split payments.',
                icon: 'Banknote',
            },
            {
                title: 'Analytics & Exports',
                description: 'Sales by hour/day, product heatmaps, and one-click Excel export for auditors.',
                icon: 'BarChart3',
            },
        ],
        whatsNew: {
            items: [
                {
                    date: 'Aug 10, 2025',
                    title: 'Added coupon system',
                    body: 'Configure fixed or percentage discounts, plus scheduled promos.',
                    tag: 'Feature',
                },
                {
                    date: 'Aug 3, 2025',
                    title: 'Shift tracking improvements',
                    body: 'Faster attendance input & role-based permissions.',
                    tag: 'Upgrade',
                },
                {
                    date: 'Jul 28, 2025',
                    title: 'Multi-currency split pay',
                    body: 'Record USD+KHR in one transaction with accurate rounding.',
                    tag: 'Finance',
                },
            ],
        },
        faq: [
            { q: 'Does it work offline?', a: 'Core flows are resilient; data syncs when connection restores.' },
            { q: 'Can I use my existing printer?', a: 'Yes—most ESC/POS thermal printers are supported.' },
            { q: 'Do you support ABA PayWay?', a: 'Yes, for subscriptions and checkout (where applicable).' },
            { q: 'Is there a free plan?', a: 'Yes—test features and upgrade anytime.' },
        ],
        cta: {
            label: 'Ready to speed up your operations?',
            sublabel: 'Start free today. No credit card required.',
            primaryText: 'Get Started Free',
            primaryHref: '#',
            secondaryText: 'Book a Demo',
            secondaryHref: '#',
        },
    };

    return <FeaturePage {...data} />;
}
