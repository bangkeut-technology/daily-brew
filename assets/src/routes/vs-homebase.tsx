import { createFileRoute } from '@tanstack/react-router';
import { CompetitorView } from '@/components/marketing/CompetitorView';
import { getCompetitor } from '@/lib/competitors';

export const Route = createFileRoute('/vs-homebase')({
  component: () => <CompetitorView competitor={getCompetitor('vs-homebase')!} />,
});
