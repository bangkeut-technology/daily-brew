import React from 'react';
import { Coffee } from 'lucide-react';
export const WelcomeSection = () => {
    return (
        <div className="order-2 md:order-1">
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
                <Coffee className="h-3.5 w-3.5" />
                Brewed for cafés & small teams
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-bold leading-tight">
                Welcome back to
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    DailyBrew
                </span>
            </h1>
            <p className="mt-3 text-muted-foreground max-w-prose">
                Track attendance, evaluate KPIs, and prep payroll — without the clutter. Sign in to continue where you
                left off.
            </p>

            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                <li>• Quick daily inputs with a clean Gantt view</li>
                <li>• Weighted KPI templates & history snapshots</li>
                <li>• Free to start, simple upgrade path</li>
            </ul>
        </div>
    );
};
