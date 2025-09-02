import React from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/console/_authenticated/_layout/settings')({
    component: SettingsPage,
});

function SettingsPage() {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-gray-600">Manage your account settings here.</p>
        </div>
    );
}
