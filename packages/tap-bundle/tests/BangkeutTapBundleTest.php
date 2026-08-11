<?php

declare(strict_types=1);

namespace Bangkeut\TapBundle\Tests;

use Bangkeut\Tap\Credential\CredentialStore;
use Bangkeut\Tap\Credential\IssuerKeyStore;
use Bangkeut\Tap\Exception\PassRevoked;
use Bangkeut\Tap\Issuance\PassIssuer;
use Bangkeut\Tap\Nonce\NonceStore;
use Bangkeut\Tap\Revocation\InMemoryRevocationStore;
use Bangkeut\Tap\Revocation\RevocationStore;
use Bangkeut\Tap\Signature\Es256KeyPair;
use Bangkeut\Tap\Signature\OpenSslEs256Verifier;
use Bangkeut\Tap\Signature\SignatureVerifier;
use Bangkeut\Tap\TapPolicy;
use Bangkeut\Tap\TapRequest;
use Bangkeut\Tap\TapVerifier;
use Bangkeut\Tap\Tests\Support\FrozenClock;
use Bangkeut\Tap\Tests\Support\InMemoryCredentialStore;
use Bangkeut\Tap\Tests\Support\InMemoryIssuerKeyStore;
use Bangkeut\Tap\Tests\Support\InMemoryNonceStore;
use Bangkeut\TapBundle\BangkeutTapBundle;
use Bangkeut\TapBundle\TapService;
use PHPUnit\Framework\TestCase;
use Psr\Clock\ClockInterface;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use Symfony\Component\DependencyInjection\Loader\PhpFileLoader;

class BangkeutTapBundleTest extends TestCase
{
    private const string EVENT = 'amcham0926ex';
    private const string PASS = 'pass11223344';

    private static ?Es256KeyPair $issuerKey = null;

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

    public function testTheVerifierStillCompilesWhenTheHostRevokesNothing(): void
    {
        // Revocation is optional, so a device-only host must not have to register a store — and
        // must not get a container that fails to compile because it didn't.
        $verifier = $this->compiledVerifier(revoked: null);

        $this->assertSame(
            self::PASS,
            $verifier->verify($this->request())->subjectId,
        );
    }

    public function testARegisteredRevocationStoreIsBoundToTheVerifier(): void
    {
        $this->expectException(PassRevoked::class);
        $this->compiledVerifier(revoked: self::PASS)->verify($this->request());
    }

    private function compiledVerifier(?string $revoked): TapVerifier
    {
        $container = $this->load(['policy' => [
            'max_age_seconds' => 120,
            'max_future_skew_seconds' => 30,
            'nonce_ttl_seconds' => 900,
            'pass_reuse_cooldown_seconds' => 0,
            'batch_max_age_seconds' => 86400,
        ]]);

        // Real definitions, not runtime instances: autowiring runs at compile time and only sees
        // what the container was told about before then — which is the thing under test here.
        $container->register(CredentialStore::class, InMemoryCredentialStore::class);
        $container->register(NonceStore::class, InMemoryNonceStore::class);
        $container->register(IssuerKeyStore::class, InMemoryIssuerKeyStore::class)
            ->addMethodCall('add', [self::EVENT, self::issuerKey()->publicKeyPem]);
        $container->register(ClockInterface::class, FrozenClock::class)
            ->setFactory([FrozenClock::class, 'at'])
            ->setArguments(['2026-09-26 08:30:00']);

        if ($revoked !== null) {
            $container->register(RevocationStore::class, InMemoryRevocationStore::class)
                ->setArguments([self::EVENT, [$revoked]]);
        }

        $container->getDefinition(TapVerifier::class)->setPublic(true);
        $container->compile();

        /** @var TapVerifier $verifier */
        $verifier = $container->get(TapVerifier::class);

        return $verifier;
    }

    private function request(): TapRequest
    {
        $pass = (new PassIssuer(self::issuerKey()->privateKeyPem))->issue(
            self::PASS,
            self::EVENT,
            new \DateTimeImmutable('2026-09-26 07:00:00'),
            new \DateTimeImmutable('2026-09-26 19:00:00'),
        );

        return new TapRequest($pass->bytes, random_bytes(16), 'gate-hall-a', self::EVENT);
    }

    /** One key for the whole test run — generating P-256 keys per case is the slow part. */
    private static function issuerKey(): Es256KeyPair
    {
        return self::$issuerKey ??= Es256KeyPair::generate();
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
