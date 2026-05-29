import { createFileRoute } from '@tanstack/react-router';
import { CompetitorView } from '@/components/marketing/CompetitorView';
import { getCompetitor } from '@/lib/competitors';

export const Route = createFileRoute('/vs-clockify')({
  component: () => <CompetitorView competitor={getCompetitor('vs-clockify')!} />,
});
