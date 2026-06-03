import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/console/employees/$publicId/')({
  validateSearch: (search: Record<string, unknown>): { created?: boolean } => {
    const created = search.created === true || search.created === 'true' || search.created === '1';
    return created ? { created } : {};
  },
});
