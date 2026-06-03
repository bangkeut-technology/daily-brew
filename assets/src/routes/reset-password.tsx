import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/reset-password')({
  validateSearch: (search: Record<string, unknown>): { token: string } => {
    return { token: (search.token as string) || '' };
  },
});
