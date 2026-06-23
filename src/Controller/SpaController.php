<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\Seo\SeoMetaResolver;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class SpaController extends AbstractController
{
    #[Route('/{reactRouting}', name: 'app_spa', requirements: ['reactRouting' => '(?!api).*'], priority: -1)]
    public function index(
        Request $request,
        SeoMetaResolver $seoMetaResolver,
        int $maxFreeEmployees,
        string $contactEmail,
        string $googleClientId,
        string $appleClientId,
        string $paddleEnvironment,
        string $paddleClientSideToken,
        string $paddlePriceIdEspressoMonthly,
        string $paddlePriceIdEspressoAnnual,
        string $paddlePriceIdDoubleEspressoMonthly,
        string $paddlePriceIdDoubleEspressoAnnual,
        string $gaMeasurementId,
        string $telegramBotUsername,
        string $supportdockApiKey,
    ): Response {
        $locale = $this->resolveLocale($request, $seoMetaResolver);
        $seo = $seoMetaResolver->resolve($request->getPathInfo(), $locale);

        $response = $this->render('page/index.html.twig', [
            'maxFreeEmployees' => $maxFreeEmployees,
            'contactEmail' => $contactEmail,
            'googleClientId' => $googleClientId,
            'appleClientId' => $appleClientId,
            'paddleEnvironment' => $paddleEnvironment,
            'paddleClientSideToken' => $paddleClientSideToken,
            'paddlePriceIdEspressoMonthly' => $paddlePriceIdEspressoMonthly,
            'paddlePriceIdEspressoAnnual' => $paddlePriceIdEspressoAnnual,
            'paddlePriceIdDoubleEspressoMonthly' => $paddlePriceIdDoubleEspressoMonthly,
            'paddlePriceIdDoubleEspressoAnnual' => $paddlePriceIdDoubleEspressoAnnual,
            'gaMeasurementId' => $gaMeasurementId,
            'telegramBotUsername' => $telegramBotUsername,
            'supportdockApiKey' => $supportdockApiKey,
            'user' => null,
            'metaTitle' => $seo->title,
            'metaDescription' => $seo->description,
            'canonicalUrl' => $seo->canonical,
            'ogUrl' => $seo->canonical ?? SeoMetaResolver::BASE_URL.'/',
            'robots' => $seo->robots(),
            // Multilingual SEO surface — consumed by base.html.twig to emit
            // <html lang>, hreflang link tags, and to seed the SPA's i18n.
            'htmlLang' => $seo->locale,
            'hreflangAlternates' => $seo->alternates,
            'currentPath' => $this->pathOnly($request),
            // JSON-LD structured data — emitted site-wide so every crawled page
            // exposes Organization + SoftwareApplication. Page-specific schema
            // (FAQPage, Article) lives in the per-page template extension when
            // we add it; for now the global data is enough for rich results.
            'structuredData' => $this->siteStructuredData(),
        ]);

        $response->setStatusCode($seo->statusCode);

        // Tell shared caches that the response varies by language signal so a
        // cached Khmer page never gets served to an English request.
        $response->setVary(['Accept-Language', 'Cookie']);

        return $response;
    }

    /**
     * Resolve the SEO/UI locale for this request, in priority order:
     *   1. `?lang=fr` (or km/en) query parameter — explicit user/SEO choice
     *   2. `dailybrew_lang` cookie — sticky preference set by the SPA's switcher
     *   3. `Accept-Language` header — browser default
     *   4. The resolver's default ('en')
     *
     * Anything that doesn't match a supported locale falls through to the next layer.
     */
    private function resolveLocale(Request $request, SeoMetaResolver $resolver): string
    {
        $candidates = [
            $request->query->get('lang'),
            $request->cookies->get('dailybrew_lang'),
            $request->getPreferredLanguage(SeoMetaResolver::LOCALES),
        ];

        foreach ($candidates as $raw) {
            if (null === $raw || '' === $raw) {
                continue;
            }
            $normalized = $resolver->normalizeLocale($raw);
            if (SeoMetaResolver::DEFAULT_LOCALE !== $normalized || in_array(strtolower((string) $raw), SeoMetaResolver::LOCALES, true)) {
                // Either a non-default match, or an explicit 'en' (don't fall through
                // when the user actively asked for English).
                return $normalized;
            }
        }

        return SeoMetaResolver::DEFAULT_LOCALE;
    }

    private function pathOnly(Request $request): string
    {
        return $request->getPathInfo();
    }

    /**
     * Site-wide JSON-LD: Organization + SoftwareApplication.
     * Emitted as a single @graph entry inside one <script type="application/ld+json"> tag
     * so crawlers see both pieces with one parse.
     *
     * @return array<string, mixed>
     */
    private function siteStructuredData(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@graph' => [
                [
                    '@type' => 'Organization',
                    '@id' => SeoMetaResolver::BASE_URL.'/#organization',
                    'name' => 'DailyBrew',
                    'url' => SeoMetaResolver::BASE_URL.'/',
                    'logo' => SeoMetaResolver::BASE_URL.'/android-chrome-512.png',
                    'sameAs' => [
                        'https://apps.apple.com/us/app/dailybrew-staff-attendance/id6761321594',
                        'https://play.google.com/store/apps/details?id=work.dailybrew.mobile',
                    ],
                ],
                [
                    '@type' => 'SoftwareApplication',
                    '@id' => SeoMetaResolver::BASE_URL.'/#software',
                    'name' => 'DailyBrew',
                    'applicationCategory' => 'BusinessApplication',
                    'operatingSystem' => 'Web, iOS, Android',
                    'description' => 'QR check-in, shift tracking, and leave management for restaurants.',
                    'offers' => [
                        '@type' => 'Offer',
                        'price' => '0',
                        'priceCurrency' => 'USD',
                        'description' => 'Free for up to 10 employees.',
                    ],
                    'aggregateRating' => null,
                    'publisher' => ['@id' => SeoMetaResolver::BASE_URL.'/#organization'],
                ],
            ],
        ];
    }
}
