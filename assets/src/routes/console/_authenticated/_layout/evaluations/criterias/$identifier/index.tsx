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
            <h1 className="text-2xl font-bold">Evaluation Criteria Details for {data.name}</h1>
            <div className="mt-4">
                <p>
                    <strong>Description:</strong> {data.description}
                </p>
                <p>
                    <strong>Active:</strong> {data.active ? 'Yes' : 'No'}
                </p>
                <p>
                    <strong>Criterias:</strong>
                </p>
                <ul>
                    {data.criterias.map((criteria, index) => (
                        <li key={index}>
                            {criteria.label}: {criteria.description} (Weight: {criteria.weight})
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
