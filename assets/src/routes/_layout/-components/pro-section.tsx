import { BarChart3, MapPin, ShieldCheck, Wifi } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';

export function ProSection() {
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
