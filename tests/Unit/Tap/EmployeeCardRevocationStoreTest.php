<?php

declare(strict_types=1);

namespace App\Tests\Unit\Tap;

use App\Entity\EmployeeCard;
use App\Repository\EmployeeCardRepository;
use App\Tap\EmployeeCardRevocationStore;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

#[AllowMockObjectsWithoutExpectations]
class EmployeeCardRevocationStoreTest extends TestCase
{
    private EmployeeCardRepository&MockObject $cards;
    private EmployeeCardRevocationStore $store;

    protected function setUp(): void
    {
        $this->cards = $this->createMock(EmployeeCardRepository::class);
        $this->store = new EmployeeCardRevocationStore($this->cards);
    }

    public function testALiveCardIsNotRevoked(): void
    {
        $this->cards->method('findByPassIdAndWorkspacePublicId')->willReturn(new EmployeeCard());

        self::assertFalse($this->store->isRevoked('m4rt2wq8xkph', 'wsp3kq7m2xzn'));
    }

    public function testARevokedCardIsRevoked(): void
    {
        $card = new EmployeeCard();
        $card->revoke('owner@example.com', 'lost');
        $this->cards->method('findByPassIdAndWorkspacePublicId')->willReturn($card);

        self::assertTrue($this->store->isRevoked('m4rt2wq8xkph', 'wsp3kq7m2xzn'));
    }

    public function testAnUnknownPassIdCountsAsRevoked(): void
    {
        // A signature that verifies against a workspace key but names no card we
        // hold is not a card to admit — treating "unknown" as "fine" would turn
        // any leaked issuer key into unlimited valid cards.
        $this->cards->method('findByPassIdAndWorkspacePublicId')->willReturn(null);

        self::assertTrue($this->store->isRevoked('m4rt2wq8xkph', 'wsp3kq7m2xzn'));
    }

    public function testAStoreFailureRefusesTheTapRatherThanAdmittingIt(): void
    {
        $this->cards->method('findByPassIdAndWorkspacePublicId')
            ->willThrowException(new \RuntimeException('database is down'));

        // The interface requires failing closed: the exception must propagate so
        // the verifier refuses, not be swallowed into "not revoked".
        $this->expectException(\RuntimeException::class);
        $this->store->isRevoked('m4rt2wq8xkph', 'wsp3kq7m2xzn');
    }
}
