import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { fetchEvaluationCriteria } from '@/services/evaluation-criteria';

export const Route = createFileRoute('/console/_authenticated/_layout/evaluations/criterias/$identifier/')({
    component: EvaluationDetails,
    loader: ({ params: { identifier } }) => fetchEvaluationCriteria(identifier),
});

function EvaluationDetails() {
    const data = Route.useLoaderData();
    return (
        <div className="w-full h-full flex items-center justify-center">
            <h1 className="text-2xl font-bold">Evaluation Criteria Details for {data.label}</h1>
            <div className="mt-4">
                <p>
                    <strong>Description:</strong> {data.description}
                </p>
                <p>
                    <strong>Weight:</strong> {data.weight}
                </p>
                <p>
                    <strong>Templates:</strong>
                </p>
                <ul>
                    {data.templates.map((template, index) => (
                        <li key={index}>
                            {template.name}: {template.description}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
