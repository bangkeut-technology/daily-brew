import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { fetchEvaluationTemplate } from '@/services/evaluation-template';
import { useQuery } from '@tanstack/react-query';
import { Loading } from '@/components/loader/loading';
import { useTranslation } from 'react-i18next';
import { NotFound } from '@/components/not-found';
import { ClipboardX } from 'lucide-react';

export const Route = createFileRoute('/console/_authenticated/_layout/evaluations/templates/$identifier/')({
    component: EvaluationTemplateDetails,
    loader: ({ params: { identifier } }) => fetchEvaluationTemplate(identifier),
});

function EvaluationTemplateDetails() {
    const { identifier } = Route.useParams();
    const { t } = useTranslation();
    const { data, isPending } = useQuery({
        queryKey: ['evaluation-template', identifier],
        queryFn: () => fetchEvaluationTemplate(identifier),
        refetchOnWindowFocus: false,
    });

    if (isPending) {
        return <Loading loadingText={t('evaluation_templates.loading', { ns: 'glossary' })} />;
    }

    if (!data) {
        return (
            <NotFound icon={<ClipboardX />} notFoundText={t('evaluation_templates.not_found', { ns: 'glossary' })} />
        );
    }

    return (
        <div className="w-full px-6 py-4 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{data.name}</h1>
            </div>
        </div>
    );
}
