<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Tests;

use Bangkeut\Tap\Exception\PassRecentlyUsed;
use Bangkeut\Tap\Exception\PassRevoked;
use Bangkeut\Tap\Issuance\IssuedPass;
use Bangkeut\Tap\Issuance\PassId;
use Bangkeut\Tap\Issuance\PassIssuer;
use Bangkeut\Tap\Revocation\InMemoryRevocationStore;
use Bangkeut\Tap\Revocation\NullRevocationStore;
use Bangkeut\Tap\Revocation\RevocationStore;
use Bangkeut\Tap\Signature\Es256KeyPair;
use Bangkeut\Tap\Signature\OpenSslEs256Verifier;
use Bangkeut\Tap\TapPolicy;
use Bangkeut\Tap\TapRequest;
use Bangkeut\Tap\TapVerifier;
use Bangkeut\Tap\Tests\Support\FrozenClock;
use Bangkeut\Tap\Tests\Support\InMemoryCredentialStore;
use Bangkeut\Tap\Tests\Support\InMemoryIssuerKeyStore;
use Bangkeut\Tap\Tests\Support\InMemoryNonceStore;
use PHPUnit\Framework\TestCase;

/**
 * Taking a pass back. The signature can't be un-signed and the issuer can't reach the wallet it
 * sits in, so revocation is the door being told — which is why it has to survive being offline.
 */
class PassRevocationTest extends TestCase
{
    private const string EVENT = 'amcham0926ex';
    private const string GATE = 'gate-hall-a';

    private Es256KeyPair $issuerKey;
    private PassIssuer $issuer;
    private FrozenClock $clock;
    private InMemoryNonceStore $nonces;

    protected function setUp(): void
    {
        $this->issuerKey = Es256KeyPair::generate();
        $this->issuer = new PassIssuer($this->issuerKey->privateKeyPem);
        $this->clock = FrozenClock::at('2026-09-26 08:30:00');
        $this->nonces = new InMemoryNonceStore();
    }

    public function testARevokedPassIsRefusedEvenThoughItIsPerfectlyValid(): void
    {
        $pass = $this->issue();
        $revocations = new InMemoryRevocationStore();
        $revocations->revoke(self::EVENT, $pass->passId);

        $this->expectException(PassRevoked::class);
        $this->expectExceptionMessage('This pass has been withdrawn.');

        $this->verifier($revocations)->verify($this->request($pass));
    }

    public function testAPassIsAdmittedWhenSomeoneElsesWasRevoked(): void
    {
        $pass = $this->issue();
        $revocations = new InMemoryRevocationStore();
        $revocations->revoke(self::EVENT, PassId::generate());

        $this->assertSame($pass->passId, $this->verifier($revocations)->verify($this->request($pass))->subjectId);
    }

    public function testRevocationIsScopedToItsEvent(): void
    {
        $pass = $this->issue();
        $revocations = new InMemoryRevocationStore();
        // Same id, different event — a terminal must not act on another event's list.
        $revocations->revoke('eurocham0926', $pass->passId);

        $this->assertSame($pass->passId, $this->verifier($revocations)->verify($this->request($pass))->subjectId);
    }

    public function testTheDefaultIsNoRevocationAtAll(): void
    {
        // A device-only deployment revokes through the credential store and shouldn't have to think
        // about this; the default has to keep behaving exactly as it did before revocation existed.
        $pass = $this->issue();

        $this->assertFalse((new NullRevocationStore())->isRevoked($pass->passId, self::EVENT));
        $this->assertSame($pass->passId, $this->verifier()->verify($this->request($pass))->subjectId);
    }

    public function testARevokedPassDoesNotBurnTheAntiPassbackSlot(): void
    {
        $revoked = $this->issue();
        $stillGood = $this->issue();

        $revocations = new InMemoryRevocationStore();
        $revocations->revoke(self::EVENT, $revoked->passId);

        $verifier = $this->verifier($revocations, new TapPolicy(passReuseCooldownSeconds: 300));

        try {
            $verifier->verify($this->request($revoked));
            $this->fail('A revoked pass should not be admitted.');
        } catch (PassRevoked) {
            // expected
        }

        // The refusal must leave the nonce store untouched: the cooldown belongs to whoever taps
        // next, and a refused tap that consumes state turns one bad pass into a broken door.
        $this->assertSame([], $this->nonces->claimed);
        $this->assertSame($stillGood->passId, $verifier->verify($this->request($stillGood))->subjectId);
    }

    public function testAStoreThatCannotAnswerRefusesTheTap(): void
    {
        $unavailable = new class implements RevocationStore {
            public function isRevoked(string $passId, string $audienceId): bool
            {
                throw new \RuntimeException('revocation database is down');
            }
        };

        // Fail closed. A door that cannot tell whether a ticket was refunded must not wave people
        // through — the operator's answer is to sync a list and go offline, not to ignore the check.
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('revocation database is down');

        $this->verifier($unavailable)->verify($this->request($this->issue()));
    }

    public function testRevocationIsNotConsultedForAGarbageSignature(): void
    {
        $pass = $this->issue();

        // Forge a pass id that was never minted, signed with an untrusted key.
        $forged = (new PassIssuer(Es256KeyPair::generate()->privateKeyPem))->issue(
            PassId::generate(),
            self::EVENT,
            $this->at('-1 hour'),
            $this->at('+8 hours'),
        );

        $probe = new class implements RevocationStore {
            public int $calls = 0;

            public function isRevoked(string $passId, string $audienceId): bool
            {
                $this->calls++;

                return false;
            }
        };

        try {
            $this->verifier($probe)->verify($this->request($forged));
            $this->fail('A pass from an untrusted signer should not be admitted.');
        } catch (\Bangkeut\Tap\Exception\InvalidSignature) {
            // expected
        }

        // Nothing hit the store: an unauthenticated forger must not be able to use a door as an
        // oracle for which pass ids exist.
        $this->assertSame(0, $probe->calls);

        $this->verifier($probe)->verify($this->request($pass));
        $this->assertSame(1, $probe->calls);
    }

    public function testASyncedListReplacesRatherThanMergesSoAReversalTakesEffect(): void
    {
        $pass = $this->issue();
        $revocations = new InMemoryRevocationStore(self::EVENT, [$pass->passId]);

        $this->assertTrue($revocations->isRevoked($pass->passId, self::EVENT));
        $this->assertSame(1, $revocations->count(self::EVENT));

        // The next sync no longer lists it — a refund was reversed, a lost badge turned up. Merging
        // would keep refusing the holder forever with no way to undo it.
        $revocations->replace(self::EVENT, []);

        $this->assertFalse($revocations->isRevoked($pass->passId, self::EVENT));
        $this->assertSame(0, $revocations->count(self::EVENT));
        $this->assertSame($pass->passId, $this->verifier($revocations)->verify($this->request($pass))->subjectId);
    }

    public function testAnOfflineDoorEnforcesTheListItLastSynced(): void
    {
        $pass = $this->issue();
        $revocations = new InMemoryRevocationStore(self::EVENT, [$pass->passId]);

        // Queued at the door with no network, replayed later: the revocation still applies, and the
        // wider offline freshness window doesn't smuggle it past.
        $this->expectException(PassRevoked::class);
        $this->verifier($revocations)->verify(new TapRequest(
            assertion: $pass->bytes,
            nonce: random_bytes(16),
            terminalId: self::GATE,
            audienceId: self::EVENT,
            offlineBatch: true,
        ));
    }

    public function testCooldownStillAppliesToAPassThatIsNotRevoked(): void
    {
        $pass = $this->issue();
        $verifier = $this->verifier(new InMemoryRevocationStore(), new TapPolicy(passReuseCooldownSeconds: 300));

        $verifier->verify($this->request($pass));

        // Revocation is an extra gate, not a replacement for anti-passback.
        $this->expectException(PassRecentlyUsed::class);
        $verifier->verify($this->request($pass));
    }

    private function issue(): IssuedPass
    {
        return $this->issuer->issue(
            PassId::generate(),
            self::EVENT,
            $this->at('-1 hour'),
            $this->at('+8 hours'),
        );
    }

    private function at(string $modifier): \DateTimeImmutable
    {
        return $this->clock->now()->modify($modifier);
    }

    private function request(IssuedPass $pass): TapRequest
    {
        return new TapRequest(
            assertion: $pass->bytes,
            nonce: random_bytes(16),
            terminalId: self::GATE,
            audienceId: self::EVENT,
        );
    }

    private function verifier(?RevocationStore $revocations = null, ?TapPolicy $policy = null): TapVerifier
    {
        $issuerKeys = new InMemoryIssuerKeyStore();
        $issuerKeys->add(self::EVENT, $this->issuerKey->publicKeyPem);

        return new TapVerifier(
            credentials: new InMemoryCredentialStore(),
            issuerKeys: $issuerKeys,
            nonces: $this->nonces,
            signatures: new OpenSslEs256Verifier(),
            clock: $this->clock,
            policy: $policy ?? new TapPolicy(),
            revocations: $revocations ?? new NullRevocationStore(),
        );
    }
}
