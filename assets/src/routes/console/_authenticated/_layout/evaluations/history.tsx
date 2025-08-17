import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/console/_authenticated/_layout/evaluations/history')({
    component: History,
});

function History() {}
