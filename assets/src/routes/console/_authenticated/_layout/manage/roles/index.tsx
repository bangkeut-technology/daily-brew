import React from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/console/_authenticated/_layout/manage/roles/')({
    component: RolesPage,
});

function RolesPage() {
    return <div>RolesPage</div>;
}
