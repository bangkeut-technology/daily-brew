<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service\Seo;

use App\Service\Seo\SeoMetaResolver;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class SeoMetaResolverTest extends TestCase
{
    private SeoMetaResolver $resolver;

    protected function setUp(): void
    {
        $this->resolver = new SeoMetaResolver();
    }

    public function testHomepageIsIndexableWithSelfCanonicalAndNoSuffix(): void
    {
        $meta = $this->resolver->resolve('/');

        $this->assertSame('DailyBrew — Staff Attendance Tracking for Restaurants', $meta->title);
        $this->assertSame('https://dailybrew.work/', $meta->canonical);
        $this->assertTrue($meta->index);
        $this->assertSame(200, $meta->statusCode);
        $this->assertNull($meta->robots());
    }

    public function testPublicPageGetsSiteNameSuffixAndSelfCanonical(): void
    {
        $meta = $this->resolver->resolve('/pricing');

        $this->assertSame('Pricing — DailyBrew', $meta->title);
        $this->assertSame('https://dailybrew.work/pricing', $meta->canonical);
        $this->assertTrue($meta->index);
        $this->assertSame(200, $meta->statusCode);
    }

    public function testNestedPublicPageIsIndexable(): void
    {
        $meta = $this->resolver->resolve('/features/geofencing');

        $this->assertSame('Geofencing — DailyBrew', $meta->title);
        $this->assertSame('https://dailybrew.work/features/geofencing', $meta->canonical);
        $this->assertTrue($meta->index);
    }

    public function testTrailingSlashResolvesToSamePage(): void
    {
        $meta = $this->resolver->resolve('/pricing/');

        $this->assertSame('Pricing — DailyBrew', $meta->title);
        $this->assertSame('https://dailybrew.work/pricing', $meta->canonical);
        $this->assertSame(200, $meta->statusCode);
    }

    public function testUnknownPathReturns404AndNoindexWithoutCanonical(): void
    {
        $meta = $this->resolver->resolve('/status');

        $this->assertSame(404, $meta->statusCode);
        $this->assertFalse($meta->index);
        $this->assertNull($meta->canonical);
        $this->assertSame('noindex, follow', $meta->robots());
    }

    #[DataProvider('privatePaths')]
    public function testPrivatePathsLoadButAreNeverIndexed(string $path): void
    {
        $meta = $this->resolver->resolve($path);

        $this->assertSame(200, $meta->statusCode, $path.' must still load');
        $this->assertFalse($meta->index, $path.' must not be indexed');
        $this->assertNull($meta->canonical, $path.' must not advertise a canonical');
        $this->assertSame('noindex, follow', $meta->robots());
    }

    /**
     * @return iterable<string, array{string}>
     */
    public static function privatePaths(): iterable
    {
        yield 'console root' => ['/console'];
        yield 'console deep' => ['/console/dashboard'];
        yield 'admin deep' => ['/admin/users'];
        yield 'checkin' => ['/checkin/abc123'];
        yield 'auth callback' => ['/auth/callback'];
        yield 'onboarding' => ['/onboarding'];
        yield 'forgot password' => ['/forgot-password'];
        yield 'reset password' => ['/reset-password'];
    }

    public function testPrivatePrefixDoesNotMatchSimilarPublicPath(): void
    {
        // A path that merely starts with a private word but is not under the prefix.
        $meta = $this->resolver->resolve('/consoles');

        $this->assertSame(404, $meta->statusCode);
        $this->assertFalse($meta->index);
    }

    public function testQueryStringIsIgnored(): void
    {
        $meta = $this->resolver->resolve('/reset-password?token=abc');

        $this->assertSame(200, $meta->statusCode);
        $this->assertFalse($meta->index);
    }

    public function testFrenchLocaleReturnsLocalizedTitleAndDescription(): void
    {
        $meta = $this->resolver->resolve('/pricing', 'fr');

        $this->assertSame('Tarifs — DailyBrew', $meta->title);
        $this->assertStringContainsString('plans DailyBrew commencent gratuitement', $meta->description);
        $this->assertSame('fr', $meta->locale);
        $this->assertSame('https://dailybrew.work/pricing', $meta->canonical);
    }

    public function testKhmerLocaleReturnsLocalizedTitleAndDescription(): void
    {
        $meta = $this->resolver->resolve('/features', 'km');

        $this->assertStringStartsWith('លក្ខណៈពិសេស', $meta->title);
        $this->assertStringContainsString('បុគ្គលិក', $meta->description);
        $this->assertSame('km', $meta->locale);
    }

    public function testUnsupportedLocaleFallsBackToEnglish(): void
    {
        $meta = $this->resolver->resolve('/features', 'es');

        $this->assertSame('Features — DailyBrew', $meta->title);
        $this->assertSame('en', $meta->locale);
    }

    public function testBcp47LocaleTagIsNormalizedToPrimary(): void
    {
        $meta = $this->resolver->resolve('/pricing', 'fr-FR');

        $this->assertSame('Tarifs — DailyBrew', $meta->title);
        $this->assertSame('fr', $meta->locale);
    }

    public function testIndexablePageEmitsHreflangAlternates(): void
    {
        $meta = $this->resolver->resolve('/features', 'en');

        $this->assertSame('https://dailybrew.work/features', $meta->alternates['en'] ?? null);
        $this->assertSame('https://dailybrew.work/features?lang=fr', $meta->alternates['fr'] ?? null);
        $this->assertSame('https://dailybrew.work/features?lang=km', $meta->alternates['km'] ?? null);
        $this->assertSame('https://dailybrew.work/features', $meta->alternates['x-default'] ?? null);
    }

    public function testHomepageAlternatesPreserveRootSlash(): void
    {
        $meta = $this->resolver->resolve('/', 'fr');

        $this->assertSame('https://dailybrew.work/', $meta->alternates['en'] ?? null);
        $this->assertSame('https://dailybrew.work/?lang=fr', $meta->alternates['fr'] ?? null);
    }

    public function testPrivatePathHasNoAlternates(): void
    {
        $meta = $this->resolver->resolve('/console/dashboard', 'fr');

        $this->assertSame([], $meta->alternates);
    }

    public function testNotFoundTitleIsLocalized(): void
    {
        $en = $this->resolver->resolve('/status', 'en');
        $fr = $this->resolver->resolve('/status', 'fr');
        $km = $this->resolver->resolve('/status', 'km');

        $this->assertStringStartsWith('Page not found', $en->title);
        $this->assertStringStartsWith('Page introuvable', $fr->title);
        $this->assertStringStartsWith('រកមិនឃើញទំព័រ', $km->title);
        $this->assertSame(404, $en->statusCode);
        $this->assertSame(404, $fr->statusCode);
        $this->assertSame(404, $km->statusCode);
    }

    public function testIndexablePathsReturnsCanonicalListWithoutLocaleParam(): void
    {
        $paths = $this->resolver->indexablePaths();

        $this->assertContains('/', $paths);
        $this->assertContains('/features', $paths);
        $this->assertContains('/pricing', $paths);
        $this->assertGreaterThan(20, count($paths));
        // Sanity: no query strings, no duplicates.
        $this->assertSame($paths, array_values(array_unique($paths)));
        foreach ($paths as $p) {
            $this->assertStringNotContainsString('?', $p);
        }
    }

    public function testThreeFactorAttendancePageIsIndexableAndSelfCanonical(): void
    {
        $meta = $this->resolver->resolve('/three-factor-attendance');

        $this->assertSame('Three-factor attendance — DailyBrew', $meta->title);
        $this->assertSame('https://dailybrew.work/three-factor-attendance', $meta->canonical);
        $this->assertTrue($meta->index);
        $this->assertSame(200, $meta->statusCode);
        $this->assertContains('/three-factor-attendance', $this->resolver->indexablePaths());
    }

    public function testDeviceVerifiedAttendanceAliasResolvesToCanonicalFeaturePage(): void
    {
        // The alias still loads (200, indexable) — but its canonical points at
        // the real page so Google collapses the two URLs into one entry.
        $meta = $this->resolver->resolve('/device-verified-attendance');

        $this->assertSame(200, $meta->statusCode);
        $this->assertTrue($meta->index);
        $this->assertSame('https://dailybrew.work/features/device-verification', $meta->canonical);
        // Hreflang alternates also fold to the canonical, so the alias never
        // appears as the entry point for one of the language variants.
        $this->assertSame('https://dailybrew.work/features/device-verification', $meta->alternates['en'] ?? null);
        $this->assertSame('https://dailybrew.work/features/device-verification?lang=fr', $meta->alternates['fr'] ?? null);
    }

    public function testAliasPathsAreExcludedFromSitemap(): void
    {
        // indexablePaths() drives the dynamic sitemap. Listing an alias there
        // would advertise two URLs for the same content — defeats the canonical.
        $paths = $this->resolver->indexablePaths();

        $this->assertContains('/features/device-verification', $paths);
        $this->assertNotContains('/device-verified-attendance', $paths);
    }
}
