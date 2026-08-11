<?php

declare(strict_types=1);

namespace Bangkeut\TapBundle\Tests;

use Bangkeut\Tap\Assertion\AssertionCodec;
use Bangkeut\Tap\Exception\UnknownCredential;
use Bangkeut\Tap\Signature\OpenSslEs256Verifier;
use Bangkeut\Tap\TapRequest;
use Bangkeut\Tap\TapVerifier;
use Bangkeut\Tap\Tests\Support\FrozenClock;
use Bangkeut\Tap\Tests\Support\InMemoryCredential;
use Bangkeut\Tap\Tests\Support\InMemoryCredentialStore;
use Bangkeut\Tap\Tests\Support\InMemoryIssuerKeyStore;
use Bangkeut\Tap\Tests\Support\InMemoryNonceStore;
use Bangkeut\Tap\Tests\Support\TapTestKit;
use Bangkeut\TapBundle\Event\TapRejectedEvent;
use Bangkeut\TapBundle\Event\TapVerifiedEvent;
use Bangkeut\TapBundle\TapService;
use PHPUnit\Framework\TestCase;
use Psr\EventDispatcher\EventDispatcherInterface;

class TapServiceTest extends TestCase
{
    private const string HOLDER = 'abc123def456';
    private const string TERMINAL = 'kiosk-front-door';

    /** @var list<object> */
    private array $dispatched = [];

    public function testAVerifiedTapIsAnnouncedWithItsResult(): void
    {
        $codec = new AssertionCodec();
        $clock = FrozenClock::at('2026-08-11 09:00:00');
        [$privateKey, $publicKey] = TapTestKit::keyPair();

        $credentials = new InMemoryCredentialStore();
        $credentials->add(new InMemoryCredential('cred-1', self::HOLDER, $publicKey));

        $nonce = random_bytes(16);
        $tappedAt = $clock->now()->getTimestamp();
        $assertion = $codec->encodeDevice(self::HOLDER, $tappedAt, TapTestKit::sign(
            $codec->deviceSignedBytes($nonce, self::TERMINAL, self::HOLDER, $tappedAt),
            $privateKey,
        ));

        $service = new TapService(
            new TapVerifier(
                $credentials,
                new InMemoryIssuerKeyStore(),
                new InMemoryNonceStore(),
                new OpenSslEs256Verifier(),
                $clock,
                codec: $codec,
            ),
            $this->recordingDispatcher(),
        );

        $result = $service->verify(new TapRequest($assertion, $nonce, self::TERMINAL, 'wsp111222333'));

        $this->assertCount(1, $this->dispatched);
        $this->assertInstanceOf(TapVerifiedEvent::class, $this->dispatched[0]);
        $this->assertSame($result, $this->dispatched[0]->result);
    }

    public function testARefusedTapIsAnnouncedAndTheReasonStillReachesTheCaller(): void
    {
        $service = new TapService(
            new TapVerifier(
                new InMemoryCredentialStore(),
                new InMemoryIssuerKeyStore(),
                new InMemoryNonceStore(),
                new OpenSslEs256Verifier(),
                FrozenClock::at('2026-08-11 09:00:00'),
            ),
            $this->recordingDispatcher(),
        );

        $codec = new AssertionCodec();
        $request = new TapRequest(
            $codec->encodeDevice(self::HOLDER, (new \DateTimeImmutable('2026-08-11 09:00:00'))->getTimestamp(), str_repeat("\x02", 64)),
            random_bytes(16),
            self::TERMINAL,
            'wsp111222333',
        );

        try {
            $service->verify($request);
            $this->fail('Expected the unenrolled holder to be refused.');
        } catch (UnknownCredential $reason) {
            $this->assertCount(1, $this->dispatched);
            $this->assertInstanceOf(TapRejectedEvent::class, $this->dispatched[0]);
            $this->assertSame($reason, $this->dispatched[0]->reason);
            $this->assertSame($request, $this->dispatched[0]->request);
        }
    }

    private function recordingDispatcher(): EventDispatcherInterface
    {
        return new class($this->dispatched) implements EventDispatcherInterface {
            /** @param list<object> $dispatched */
            public function __construct(private array &$dispatched)
            {
            }

            public function dispatch(object $event): object
            {
                $this->dispatched[] = $event;

                return $event;
            }
        };
    }
}
