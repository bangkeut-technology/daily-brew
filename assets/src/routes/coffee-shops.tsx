import { createFileRoute } from '@tanstack/react-router';
import { IndustryView } from '@/components/marketing/IndustryView';
import { getIndustry } from '@/lib/industries';

export const Route = createFileRoute('/coffee-shops')({
  component: () => <IndustryView industry={getIndustry('coffee-shops')!} />,
});
