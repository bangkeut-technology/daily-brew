<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service\Card;

use App\Entity\Attendance;
use App\Entity\Employee;
use App\Entity\EmployeeCard;
use App\Entity\Workspace;
use App\Repository\CardTapRepository;
use App\Repository\EmployeeCardRepository;
use App\Service\Card\CardTapService;
use App\Service\CheckinService;
use App\Service\DateService;
use Bangkeut\Tap\Assertion\AssertionCodec;
use Bangkeut\Tap\Credential\IssuerKeyStore;
use Bangkeut\Tap\Exception\AudienceMismatch;
use Bangkeut\Tap\Exception\PassRecentlyUsed;
use Bangkeut\Tap\Exception\PassRevoked;
use Bangkeut\Tap\Issuance\PassIssuer;
use Bangkeut\Tap\Nonce\NonceStore;
use Bangkeut\Tap\Revocation\RevocationStore;
use Bangkeut\Tap\Signature\Es256KeyPair;
use Bangkeut\Tap\Signature\OpenSslEs256Verifier;
use Bangkeut\Tap\TapPolicy;
use Bangkeut\Tap\TapVerifier;
use Bangkeut\TapBundle\TapService;
use App\Tap\NoDeviceCredentialStore;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Clock\MockClock;
use Symfony\Component\EventDispatcher\EventDispatcher;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * Exercises the real verifier rather than a mocked one: the point of this path
 * is that a forged, expired, foreign or replayed card is refused, and a double
 * of the verifier would test nothing.
 */
#[AllowMockObjectsWithoutExpectations]
class CardTapServiceTest extends TestCase
{
    private const string AUDIENCE = 'wsp3kq7m2xzn';
    private const string TERMINAL = 'front-door-01';

    private Es256KeyPair $keyPair;
    private EmployeeCardRepository&MockObject $cards;
    private CardTapRepository&MockObject $tapLog;
    private CheckinService&MockObject $checkin;
    private Workspace $workspace;
    private EmployeeCard $card;
    private MockClock $clock;

    /** @var array<string, bool> */
    private array $revoked = [];
    /** @var array<string, true> */
    private array $consumed = [];

    protected function setUp(): void
    {
        $this->clock = new MockClock('2026-08-19 06:00:00', new \DateTimeZone('UTC'));
        DateService::setClock($this->clock);

        $this->keyPair = Es256KeyPair::generate();

        $this->workspace = new Workspace();
        (new \ReflectionProperty($this->workspace, 'publicId'))->setValue($this->workspace, self::AUDIENCE);

        $employee = new Employee();
        $employee->setWorkspace($this->workspace);

        $this->card = new EmployeeCard();
        $this->card->setEmployee($employee)->setWorkspace($this->workspace);

        $this->cards = $this->createMock(EmployeeCardRepository::class);
        $this->cards->method('findByPassIdAndWorkspacePublicId')->willReturnCallback(
            fn (string $passId): ?EmployeeCard => $passId === $this->card->getPublicId() ? $this->card : null,
        );

        $this->tapLog = $this->createMock(CardTapRepository::class);
        $this->checkin = $this->createMock(CheckinService::class);
    }

    protected function tearDown(): void
    {
        DateService::setClock(null);
    }

    public function testAValidCardPunchesTheClock(): void
    {
        $this->tapLog->method('claim')->willReturn(true);
        $attendance = new Attendance();
        $this->checkin->expects(self::once())->method('checkin')->willReturn($attendance);

        $result = $this->service()->tap(
            $this->workspace,
            $this->pass(),
            self::TERMINAL,
            'nonce-1',
            null,
            false,
            '203.0.113.7',
        );

        self::assertSame($attendance, $result['attendance']);
        self::assertFalse($result['duplicate']);
    }

    public function testTheKiosksOwnTapTimeIsWhatGetsRecorded(): void
    {
        // An issued pass carries no signed tap time and the verifier stamps the
        // moment it ran, so a queue replayed hours later would file every punch
        // at replay time unless the terminal's own clock wins.
        $tappedAt = new \DateTimeImmutable('2026-08-19 02:15:00', new \DateTimeZone('UTC'));
        $seen = null;
        $this->tapLog->method('claim')->willReturnCallback(
            function (string $passId, string $terminalId, \DateTimeImmutable $at) use (&$seen): bool {
                $seen = $at;

                return true;
            },
        );
        $this->checkin->method('checkin')->willReturn(new Attendance());

        $this->service()->tap($this->workspace, $this->pass(), self::TERMINAL, 'n', $tappedAt, true, '203.0.113.7');

        self::assertEquals($tappedAt, $seen);
    }

    public function testAReplayedTapDoesNotPunchAgain(): void
    {
        // This is the one that matters: a second punch is read as a *check-out*,
        // so a re-submitted offline queue would close the whole crew's shift.
        $this->tapLog->method('claim')->willReturn(false);
        $this->checkin->expects(self::never())->method('checkin');
        $this->checkin->method('getStatus')->willReturn(new Attendance());

        $result = $this->service()->tap(
            $this->workspace,
            $this->pass(),
            self::TERMINAL,
            'n',
            new \DateTimeImmutable('2026-08-19 06:00:00'),
            true,
            '203.0.113.7',
        );

        self::assertTrue($result['duplicate']);
    }

    public function testARevokedCardIsRefused(): void
    {
        $this->revoked[$this->card->getPublicId()] = true;
        $this->checkin->expects(self::never())->method('checkin');

        $this->expectException(PassRevoked::class);
        $this->service()->tap($this->workspace, $this->pass(), self::TERMINAL, 'n', null, false, '203.0.113.7');
    }

    public function testACardMintedForAnotherWorkspaceIsRefused(): void
    {
        $foreign = (new PassIssuer($this->keyPair->privateKeyPem))->issue(
            $this->card->getPublicId(),
            'otherwspace1',
            DateService::now()->modify('-1 day'),
            DateService::now()->modify('+1 year'),
        );

        $this->expectException(AudienceMismatch::class);
        $this->service()->tap($this->workspace, $foreign->base64Url, self::TERMINAL, 'n', null, false, '203.0.113.7');
    }

    public function testTappingTwiceAtTheSameDoorTripsAntiPassback(): void
    {
        $this->tapLog->method('claim')->willReturn(true);
        $this->checkin->method('checkin')->willReturn(new Attendance());

        $service = $this->service();
        $pass = $this->pass();
        $service->tap($this->workspace, $pass, self::TERMINAL, 'n1', null, false, '203.0.113.7');

        $this->expectException(PassRecentlyUsed::class);
        $service->tap($this->workspace, $pass, self::TERMINAL, 'n2', null, false, '203.0.113.7');
    }

    public function testGarbageBytesAreRefusedBeforeAnythingElseHappens(): void
    {
        $this->checkin->expects(self::never())->method('checkin');

        $this->expectException(\Bangkeut\Tap\Exception\TapException::class);
        $this->service()->tap($this->workspace, 'not-a-pass', self::TERMINAL, 'n', null, false, '203.0.113.7');
    }

    public function testATerminalIdIsRequired(): void
    {
        $this->expectException(BadRequestHttpException::class);
        $this->service()->tap($this->workspace, $this->pass(), '  ', 'n', null, false, '203.0.113.7');
    }

    /** A pass signed by the workspace key, valid now. */
    private function pass(): string
    {
        return (new PassIssuer($this->keyPair->privateKeyPem))->issue(
            $this->card->getPublicId(),
            self::AUDIENCE,
            DateService::now()->modify('-1 day'),
            DateService::now()->modify('+1 year'),
        )->base64Url;
    }

    private function service(): CardTapService
    {
        $issuerKeys = new class ($this->keyPair->publicKeyPem) implements IssuerKeyStore {
            public function __construct(private string $pem) {}

            public function publicKeysFor(string $audienceId): iterable
            {
                return [$this->pem];
            }
        };

        $revocations = new class ($this->revoked) implements RevocationStore {
            /** @param array<string, bool> $revoked */
            public function __construct(private array $revoked) {}

            public function isRevoked(string $passId, string $audienceId): bool
            {
                return $this->revoked[$passId] ?? false;
            }
        };

        $nonces = new class ($this->consumed) implements NonceStore {
            /** @param array<string, true> $consumed */
            public function __construct(private array $consumed) {}

            public function consume(string $scope, string $token, int $ttlSeconds): bool
            {
                $key = $scope . '|' . $token;
                if (isset($this->consumed[$key])) {
                    return false;
                }
                $this->consumed[$key] = true;

                return true;
            }
        };

        $verifier = new TapVerifier(
            credentials: new NoDeviceCredentialStore(),
            issuerKeys: $issuerKeys,
            nonces: $nonces,
            signatures: new OpenSslEs256Verifier(),
            clock: $this->clock,
            policy: new TapPolicy(passReuseCooldownSeconds: 60),
            revocations: $revocations,
        );

        return new CardTapService(
            new TapService($verifier, new EventDispatcher()),
            new AssertionCodec(),
            $this->cards,
            $this->tapLog,
            $this->checkin,
        );
    }
}
