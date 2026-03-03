import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { createFileRoute } from '@tanstack/react-router';
import { Helmet } from 'react-helmet-async';

export const Route = createFileRoute('/_layout/status/')({
    component: StatusPage,
});

function StatusPage() {
    const services = [
        {
            name: 'API',
            status: 'operational',
            lastChecked: '2 minutes ago',
        },
        {
            name: 'Database',
            status: 'degraded',
            lastChecked: '5 minutes ago',
        },
        {
            name: 'Authentication',
            status: 'operational',
            lastChecked: '2 minutes ago',
        },
        {
            name: 'Payments',
            status: 'maintenance',
            lastChecked: '10 minutes ago',
        },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'operational':
                return (
                    <Badge className="bg-green-500 text-white">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Operational
                    </Badge>
                );
            case 'degraded':
                return (
                    <Badge className="bg-yellow-500 text-white">
                        <AlertCircle className="w-3 h-3 mr-1" /> Degraded
                    </Badge>
                );
            case 'maintenance':
                return (
                    <Badge className="bg-blue-500 text-white">
                        <Clock className="w-3 h-3 mr-1" /> Maintenance
                    </Badge>
                );
            default:
                return <Badge>Unknown</Badge>;
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-16 px-6">
            <Helmet>
                <title>System Status — DailyBrew</title>
                <meta name="robots" content="noindex" />
            </Helmet>
            <h1 className="text-4xl font-bold mb-6">System Status</h1>
            <p className="text-lg text-muted-foreground mb-12">
                Real-time information about the status of our services.
            </p>

            <div className="grid gap-6">
                {services.map((service) => (
                    <Card key={service.name} className="rounded-2xl shadow-sm">
                        <CardContent className="flex justify-between items-center py-6">
                            <div>
                                <h2 className="text-xl font-semibold">{service.name}</h2>
                                <p className="text-sm text-muted-foreground">Last checked {service.lastChecked}</p>
                            </div>
                            {getStatusBadge(service.status)}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-16 text-center text-sm text-muted-foreground">
                <p>
                    Want updates? Follow our{' '}
                    <a href="/console" className="underline">
                        Console
                    </a>{' '}
                    for service notifications.
                </p>
            </div>
        </div>
    );
}
