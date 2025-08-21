import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import React from 'react';
import { Link } from '@tanstack/react-router';

export function Showcase() {
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
                            <Link to="/pricing">Compare plans</Link>
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
