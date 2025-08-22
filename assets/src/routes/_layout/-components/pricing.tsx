import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import React from 'react';
import { Link } from '@tanstack/react-router';

export function Pricing() {
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
                            <Link to="/sign-up">Get started</Link>
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
