<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\Seo\SeoMetaResolver;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Dynamic XML sitemap. Replaces the static public/sitemap.xml so we can
 * emit per-locale URLs with hreflang annotations — Google's preferred way
 * to discover language variants of the same page when locales share a URL.
 *
 * For each indexable path in {@see SeoMetaResolver::indexablePaths()} we emit:
 *   - one <url> per locale (en, fr, km)
 *   - <xhtml:link rel="alternate" hreflang="…"> entries listing all variants,
 *     repeated inside each <url> as the spec requires
 *   - one priority/changefreq tier derived from the path depth so the
 *     homepage outranks deep-nested guides
 *
 * Result: 25 indexable paths × 3 locales = 75 <url> entries.
 *
 * Robots.txt already points search engines here; this controller takes over
 * the /sitemap.xml route (the static file is removed).
 */
class SitemapController extends AbstractController
{
    /**
     * Priority + changefreq per path depth tier. Higher priority for higher-value
     * marketing pages — the homepage, the wedge pages (three-factor, stop-buddy-
     * punching), pricing, and features overview. Falls back to a sensible default
     * for everything else (guides, legal, account-management).
     *
     * Keys match the literal path so we don't have to recompute on every render.
     *
     * @var array<string, array{priority: string, changefreq: string}>
     */
    private const PATH_TIERS = [
        '/'                          => ['priority' => '1.0', 'changefreq' => 'weekly'],
        '/three-factor-attendance'   => ['priority' => '0.9', 'changefreq' => 'monthly'],
        '/stop-buddy-punching'       => ['priority' => '0.9', 'changefreq' => 'monthly'],
        '/features'                  => ['priority' => '0.9', 'changefreq' => 'monthly'],
        '/pricing'                   => ['priority' => '0.9', 'changefreq' => 'monthly'],
        '/how-it-works'              => ['priority' => '0.8', 'changefreq' => 'monthly'],
        '/faq'                       => ['priority' => '0.8', 'changefreq' => 'monthly'],
        '/roles'                     => ['priority' => '0.6', 'changefreq' => 'monthly'],
        '/demo'                      => ['priority' => '0.6', 'changefreq' => 'monthly'],
        '/support'                   => ['priority' => '0.5', 'changefreq' => 'monthly'],
        '/sign-up'                   => ['priority' => '0.7', 'changefreq' => 'yearly'],
        '/sign-in'                   => ['priority' => '0.3', 'changefreq' => 'yearly'],
        '/privacy'                   => ['priority' => '0.4', 'changefreq' => 'yearly'],
        '/terms'                     => ['priority' => '0.4', 'changefreq' => 'yearly'],
        '/refund'                    => ['priority' => '0.4', 'changefreq' => 'yearly'],
        '/delete-account'            => ['priority' => '0.3', 'changefreq' => 'yearly'],
    ];

    private const FEATURE_DEFAULT = ['priority' => '0.7', 'changefreq' => 'monthly'];
    private const GUIDE_DEFAULT   = ['priority' => '0.7', 'changefreq' => 'monthly'];
    private const FALLBACK        = ['priority' => '0.5', 'changefreq' => 'monthly'];

    #[Route('/sitemap.xml', name: 'app_sitemap', methods: ['GET'])]
    public function sitemap(SeoMetaResolver $resolver): Response
    {
        $today = (new \DateTimeImmutable('now', new \DateTimeZone('UTC')))->format('Y-m-d');

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'."\n";
        $xml .= '        xmlns:xhtml="http://www.w3.org/1999/xhtml">'."\n";

        foreach ($resolver->indexablePaths() as $path) {
            $alternates = $resolver->alternatesFor($path);
            $tier = $this->tierFor($path);

            // Build one <url> per locale, each carrying the full alternates block.
            // Google's spec: every <url> must list every alternate, including itself.
            foreach (SeoMetaResolver::LOCALES as $loc) {
                $loc_url = $alternates[$loc] ?? $alternates['x-default'];

                $xml .= "  <url>\n";
                $xml .= '    <loc>'.$this->escape($loc_url)."</loc>\n";
                $xml .= '    <lastmod>'.$today."</lastmod>\n";
                $xml .= '    <changefreq>'.$tier['changefreq']."</changefreq>\n";
                $xml .= '    <priority>'.$tier['priority']."</priority>\n";

                foreach ($alternates as $code => $href) {
                    if ('x-default' === $code) {
                        $xml .= '    <xhtml:link rel="alternate" hreflang="x-default" href="'.$this->escape($href)."\" />\n";
                    } else {
                        $xml .= '    <xhtml:link rel="alternate" hreflang="'.$this->escape($code).'" href="'.$this->escape($href)."\" />\n";
                    }
                }

                $xml .= "  </url>\n";
            }
        }

        $xml .= "</urlset>\n";

        $response = new Response($xml);
        $response->headers->set('Content-Type', 'application/xml; charset=UTF-8');
        // Sitemaps don't need to be fresh on every request — let CDNs cache for an hour.
        $response->setPublic();
        $response->setMaxAge(3600);

        return $response;
    }

    /**
     * @return array{priority: string, changefreq: string}
     */
    private function tierFor(string $path): array
    {
        if (isset(self::PATH_TIERS[$path])) {
            return self::PATH_TIERS[$path];
        }
        if (str_starts_with($path, '/features/')) {
            return self::FEATURE_DEFAULT;
        }
        if (str_starts_with($path, '/guides/') || $path === '/guides') {
            return self::GUIDE_DEFAULT;
        }
        return self::FALLBACK;
    }

    private function escape(string $value): string
    {
        return htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }
}
