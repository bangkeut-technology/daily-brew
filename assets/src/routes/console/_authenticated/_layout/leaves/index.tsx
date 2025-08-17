import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/console/_authenticated/_layout/leaves/')({
    component: Leaves,
});

function Leaves() {}
