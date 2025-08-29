import React from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/console/_authenticated/_layout/performance/kpi/')({
    component: KPIPage,
});

function KPIPage() {
    return <div className="flex flex-col items-center justify-center h-full"></div>;
}
