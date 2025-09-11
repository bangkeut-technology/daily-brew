import React from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/console/_authenticated/_layout/performances/')({
    component: PerformancePage,
});

function PerformancePage() {
    return <div className="flex flex-col items-center justify-center h-full"></div>;
}
