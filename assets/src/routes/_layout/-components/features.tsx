import { BarChart3, CalendarCheck2, Clock4, MapPin, ShieldCheck, Wifi } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';

export function Features() {
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
