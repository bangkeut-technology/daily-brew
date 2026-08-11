<?php

declare(strict_types=1);

namespace Bangkeut\TapBundle;

use Bangkeut\Tap\Assertion\AssertionCodec;
use Bangkeut\Tap\Signature\OpenSslEs256Verifier;
use Bangkeut\Tap\Signature\SignatureVerifier;
use Bangkeut\Tap\TapPolicy;
use Bangkeut\Tap\TapVerifier;
use Symfony\Component\Config\Definition\Configurator\DefinitionConfigurator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use Symfony\Component\HttpKernel\Bundle\AbstractBundle;

/**
 * Wires tap-core into Symfony. Deliberately thin:
 *
 *  - no entities — the host maps its own tables onto the Credential / IssuerKeyStore interfaces;
 *  - no routes or controllers — the host owns its firewall and endpoint shapes;
 *  - no persistence — the only stateful piece, the nonce store, is an interface with one
 *    optional cache-backed implementation.
 *
 * Implement Bangkeut\Tap\Credential\CredentialStore, IssuerKeyStore and Nonce\NonceStore in the
 * application and autowiring binds them; everything else is provided here.
 */
class BangkeutTapBundle extends AbstractBundle
{
    public function configure(DefinitionConfigurator $definition): void
    {
        $definition->rootNode()
            ->children()
                ->arrayNode('policy')
                    ->addDefaultsIfNotSet()
                    ->children()
                        ->integerNode('max_age_seconds')->defaultValue(120)->min(1)->end()
                        ->integerNode('max_future_skew_seconds')->defaultValue(30)->min(0)->end()
                        ->integerNode('nonce_ttl_seconds')->defaultValue(900)->min(1)->end()
                        ->integerNode('pass_reuse_cooldown_seconds')->defaultValue(0)->min(0)->end()
                        ->integerNode('batch_max_age_seconds')->defaultValue(86400)->min(1)->end()
                    ->end()
                ->end()
            ->end();
    }

    /**
     * @param array{policy: array{max_age_seconds: int, max_future_skew_seconds: int, nonce_ttl_seconds: int, pass_reuse_cooldown_seconds: int, batch_max_age_seconds: int}} $config
     */
    public function loadExtension(array $config, ContainerConfigurator $container, ContainerBuilder $builder): void
    {
        $services = $container->services()->defaults()->autowire()->autoconfigure();

        $policy = $config['policy'];
        $services->set(TapPolicy::class)
            ->args([
                $policy['max_age_seconds'],
                $policy['max_future_skew_seconds'],
                $policy['nonce_ttl_seconds'],
                $policy['pass_reuse_cooldown_seconds'],
                $policy['batch_max_age_seconds'],
            ]);

        $services->set(AssertionCodec::class);
        $services->set(OpenSslEs256Verifier::class);
        $services->alias(SignatureVerifier::class, OpenSslEs256Verifier::class);

        $services->set(TapVerifier::class);
        $services->set(TapService::class);

        // A nonce TTL shorter than the freshness window would let a replayed assertion through
        // once its nonce record expired — cheap to check at build time, painful to find later.
        if ($policy['nonce_ttl_seconds'] <= $policy['max_age_seconds']) {
            throw new \LogicException(sprintf(
                'bangkeut_tap.policy.nonce_ttl_seconds (%d) must exceed max_age_seconds (%d), '
                .'otherwise a captured assertion becomes replayable once its nonce expires.',
                $policy['nonce_ttl_seconds'],
                $policy['max_age_seconds'],
            ));
        }
    }
}
