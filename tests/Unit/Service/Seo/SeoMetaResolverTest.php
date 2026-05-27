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
}
