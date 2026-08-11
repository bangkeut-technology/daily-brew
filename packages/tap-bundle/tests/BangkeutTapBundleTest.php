<?php

declare(strict_types=1);

namespace Bangkeut\TapBundle\Tests;

use Bangkeut\Tap\Signature\OpenSslEs256Verifier;
use Bangkeut\Tap\Signature\SignatureVerifier;
use Bangkeut\Tap\TapPolicy;
use Bangkeut\Tap\TapVerifier;
use Bangkeut\TapBundle\BangkeutTapBundle;
use Bangkeut\TapBundle\TapService;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use Symfony\Component\DependencyInjection\Loader\PhpFileLoader;

class BangkeutTapBundleTest extends TestCase
{
    public function testItRegistersTheVerifierServiceAndPolicyFromConfig(): void
    {
        $container = $this->load(['policy' => [
            'max_age_seconds' => 45,
            'max_future_skew_seconds' => 5,
            'nonce_ttl_seconds' => 600,
            'pass_reuse_cooldown_seconds' => 90,
            'batch_max_age_seconds' => 3600,
        ]]);

        $this->assertTrue($container->hasDefinition(TapVerifier::class));
        $this->assertTrue($container->hasDefinition(TapService::class));
        $this->assertTrue($container->hasAlias(SignatureVerifier::class));
        $this->assertSame(
            OpenSslEs256Verifier::class,
            (string) $container->getAlias(SignatureVerifier::class),
        );
        $this->assertSame(
            [45, 5, 600, 90, 3600],
            $container->getDefinition(TapPolicy::class)->getArguments(),
        );
    }

    public function testANonceTtlShorterThanTheFreshnessWindowIsRefusedAtBuildTime(): void
    {
        // Left alone, this configuration makes captured assertions replayable the moment their
        // nonce record expires — a silent hole, so it fails the build instead.
        $this->expectException(\LogicException::class);
        $this->expectExceptionMessageMatches('/nonce_ttl_seconds/');

        $this->load(['policy' => [
            'max_age_seconds' => 900,
            'max_future_skew_seconds' => 30,
            'nonce_ttl_seconds' => 120,
            'pass_reuse_cooldown_seconds' => 0,
            'batch_max_age_seconds' => 86400,
        ]]);
    }

    /** @param array<string, mixed> $config */
    private function load(array $config): ContainerBuilder
    {
        $container = new ContainerBuilder();
        $instanceof = [];
        $configurator = new ContainerConfigurator(
            $container,
            new PhpFileLoader($container, new FileLocator(__DIR__)),
            $instanceof,
            __DIR__,
            __FILE__,
        );

        (new BangkeutTapBundle())->loadExtension($config, $configurator, $container);

        return $container;
    }
}
