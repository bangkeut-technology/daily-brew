import React from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/console/_authenticated/_layout/evaluations/new')({
    component: NewEvaluation,
});

function NewEvaluation() {}
