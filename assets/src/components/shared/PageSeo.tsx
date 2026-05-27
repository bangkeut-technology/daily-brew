import { Helmet } from 'react-helmet-async';

interface PageSeoProps {
  title: string;
  /** Retained for call-site compatibility; description is rendered server-side. */
  description?: string;
  path: string;
  /** Retained for call-site compatibility; OG image is rendered server-side. */
  ogImage?: string;
}

const SITE_NAME = 'DailyBrew';

/**
 * Keeps the document <title> in sync during client-side navigation.
 *
 * Description, canonical, and Open Graph tags are rendered server-side
 * (see App\Service\Seo\SeoMetaResolver + base.html.twig) so crawlers and
 * link-preview scrapers — which don't execute our JS — get the correct
 * per-page values, and we never emit a second canonical/OG tag on top of
 * the server-rendered ones. The <title> is the only tag worth updating on
 * SPA navigation, and Helmet overwrites the existing element rather than
 * duplicating it.
 */
export function PageSeo({ title, path }: PageSeoProps) {
  const fullTitle = path === '/' ? title : `${title} — ${SITE_NAME}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
    </Helmet>
  );
}
