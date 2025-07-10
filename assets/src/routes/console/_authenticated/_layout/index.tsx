import React from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/console/_authenticated/_layout/')({
    component: Index,
});

function Index() {
    return (
        <div className="w-full space-y-2">
            <div className="flex flex-row space-x-2 items-center justify-center">
            </div>
            <div className="flex flex-row space-x-2 items-center justify-center">
            </div>
        </div>
    );
}
