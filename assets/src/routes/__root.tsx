import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="font-serif text-6xl font-semibold text-coffee">404</p>
      <h1 className="font-serif text-2xl font-semibold text-text-primary">{t('routes.notFound.title')}</h1>
      <p className="max-w-sm text-sm text-text-secondary">
        {t('routes.notFound.desc')}
      </p>
      <Link
        to="/"
        className="mt-3 rounded-2xl bg-coffee px-5 py-2.5 text-sm font-medium text-white no-underline transition-opacity hover:opacity-90"
      >
        {t('routes.notFound.backHome')}
      </Link>
    </div>
  );
}

export const Route = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: NotFound,
});
