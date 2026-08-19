<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service\Card;

use App\Entity\Employee;
use App\Entity\EmployeeCard;
use App\Entity\Workspace;
use App\Entity\WorkspaceIssuerKey;
use App\Repository\EmployeeCardRepository;
use App\Repository\WorkspaceIssuerKeyRepository;
use App\Service\Card\CardIssuanceService;
use App\Service\DateService;
use App\Service\Integration\SecretCipher;
use Bangkeut\Tap\Assertion\AssertionCodec;
use Bangkeut\Tap\Assertion\IssuedPassAssertion;
use Bangkeut\Tap\Signature\OpenSslEs256Verifier;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Clock\MockClock;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

#[AllowMockObjectsWithoutExpectations]
class CardIssuanceServiceTest extends TestCase
{
    private EmployeeCardRepository&MockObject $cards;
    private WorkspaceIssuerKeyRepository&MockObject $keys;
    private CardIssuanceService $service;
    private Workspace $workspace;
    private Employee $employee;

    protected function setUp(): void
    {
        DateService::setClock(new MockClock('2026-08-19 06:00:00', new \DateTimeZone('UTC')));

        $this->cards = $this->createMock(EmployeeCardRepository::class);
        $this->keys = $this->createMock(WorkspaceIssuerKeyRepository::class);

        $this->service = new CardIssuanceService(
            $this->cards,
            $this->keys,
            new SecretCipher('', 'test-app-secret-for-hkdf-derivation'),
        );

        $this->workspace = new Workspace();
        $this->setPublicId($this->workspace, 'wsp3kq7m2xzn');

        $this->employee = new Employee();
        $this->employee->setWorkspace($this->workspace);
        $this->setId($this->workspace, 1);
    }

    protected function tearDown(): void
    {
        DateService::setClock(null);
    }

    public function testIssuingMintsAKeyOnFirstUseAndSignsAVerifiablePass(): void
    {
        $this->keys->method('findActiveForWorkspace')->willReturn(null);

        $stored = null;
        $this->keys->method('update')->willReturnCallback(
            function (mixed $key) use (&$stored): void { $stored = $key; },
        );

        $result = $this->service->issue($this->workspace, $this->employee, 'Blue card', 'owner@example.com');

        self::assertInstanceOf(WorkspaceIssuerKey::class, $stored);
        self::assertStringContainsString('PUBLIC KEY', $stored->getPublicKeyPem());
        // The private half is never stored in the clear.
        self::assertStringNotContainsString('PRIVATE KEY', $stored->getPrivateKeyEncrypted());

        $assertion = (new AssertionCodec())->decode($result['pass']->bytes);
        self::assertInstanceOf(IssuedPassAssertion::class, $assertion);

        // The card's own publicId is what got signed as the passId — not the
        // employee's, so a replacement card is a different credential.
        self::assertSame($result['card']->getPublicId(), $assertion->passId);
        self::assertSame('wsp3kq7m2xzn', $assertion->audienceId);

        $verified = (new OpenSslEs256Verifier())->verify(
            (new AssertionCodec())->issuedPassSignedBytes(
                $assertion->passId,
                $assertion->audienceId,
                $assertion->notBefore,
                $assertion->notAfter,
            ),
            $assertion->signature(),
            $stored->getPublicKeyPem(),
        );
        self::assertTrue($verified, 'the pass must verify against the key that was published');
    }

    public function testIssuingReusesTheWorkspaceKeyWhenOneExists(): void
    {
        $existing = $this->existingKey();
        $this->keys->method('findActiveForWorkspace')->willReturn($existing);
        // Minting again would call update() with a *new* key entity.
        $this->keys->expects(self::never())->method('update');

        $this->service->issue($this->workspace, $this->employee, 'Card #2', null);
    }

    public function testCardsAreLongLivedSoExpiryIsNotTheRevocationMechanism(): void
    {
        $this->keys->method('findActiveForWorkspace')->willReturn($this->existingKey());

        $card = $this->service->issue($this->workspace, $this->employee, 'Blue card', null)['card'];

        self::assertGreaterThan(
            DateService::now()->modify('+1 year'),
            $card->getNotAfter(),
            'a one-year card would have every restaurant re-issuing the drawer',
        );
    }

    public function testAnEmployeeFromAnotherWorkspaceIsRefused(): void
    {
        $other = new Workspace();
        $this->setId($other, 2);
        $stranger = new Employee();
        $stranger->setWorkspace($other);

        $this->expectException(BadRequestHttpException::class);
        $this->service->issue($this->workspace, $stranger, 'Blue card', null);
    }

    public function testALabelIsRequired(): void
    {
        $this->expectException(BadRequestHttpException::class);
        $this->service->issue($this->workspace, $this->employee, '   ', null);
    }

    public function testRevokingRequiresAReason(): void
    {
        $this->expectException(BadRequestHttpException::class);
        $this->service->revoke(new EmployeeCard(), 'owner@example.com', '  ');
    }

    public function testACardCannotBeRevokedTwice(): void
    {
        $card = new EmployeeCard();
        $card->revoke('owner@example.com', 'lost');

        $this->expectException(BadRequestHttpException::class);
        $this->service->revoke($card, 'owner@example.com', 'lost again');
    }

    public function testRevokingStampsWhoAndWhy(): void
    {
        $card = new EmployeeCard();

        $this->service->revoke($card, 'manager@example.com', 'Left in a taxi');

        self::assertTrue($card->isRevoked());
        self::assertSame('manager@example.com', $card->getRevokedByEmail());
        self::assertSame('Left in a taxi', $card->getRevokeReason());
        self::assertEquals(DateService::now(), $card->getRevokedAt());
    }

    private function existingKey(): WorkspaceIssuerKey
    {
        $pair = \Bangkeut\Tap\Signature\Es256KeyPair::generate();
        $cipher = new SecretCipher('', 'test-app-secret-for-hkdf-derivation');

        return (new WorkspaceIssuerKey())
            ->setWorkspace($this->workspace)
            ->setPublicKeyPem($pair->publicKeyPem)
            ->setPrivateKeyEncrypted($cipher->encrypt($pair->privateKeyPem));
    }

    private function setPublicId(object $entity, string $value): void
    {
        $ref = new \ReflectionProperty($entity, 'publicId');
        $ref->setValue($entity, $value);
    }

    private function setId(object $entity, int $value): void
    {
        $ref = new \ReflectionProperty($entity, 'id');
        $ref->setValue($entity, $value);
    }
}
