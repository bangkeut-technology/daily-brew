<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\AuthService;
use Gesdinet\JWTRefreshTokenBundle\Model\RefreshTokenInterface;
use Gesdinet\JWTRefreshTokenBundle\Model\RefreshTokenManagerInterface;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AllowMockObjectsWithoutExpectations]
class AuthServiceTest extends TestCase
{
    // Placeholder used in register() calls — value never validated by the SUT,
    // chosen to avoid tripping generic-password secret scanners on test fixtures.
    private const string FAKE_PW = 'unit-test-placeholder';

    private UserRepository&MockObject $userRepo;
    private UserPasswordHasherInterface&MockObject $passwordHasher;
    private RefreshTokenManagerInterface&MockObject $refreshTokenManager;
    private AuthService $svc;

    protected function setUp(): void
    {
        $this->userRepo = $this->createMock(UserRepository::class);
        $this->passwordHasher = $this->createMock(UserPasswordHasherInterface::class);
        $this->refreshTokenManager = $this->createMock(RefreshTokenManagerInterface::class);
        $this->svc = new AuthService($this->userRepo, $this->passwordHasher, $this->refreshTokenManager);
    }

    // ── Register ──────────────────────────────────────────────────────

    public function testRegisterRejectsDuplicateEmail(): void
    {
        $this->userRepo->method('findByEmail')->willReturn(new User());

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Email already in use');

        $this->svc->register('owner@dailybrew.work', self::FAKE_PW);
    }

    public function testRegisterPersistsHashedUserAndCanonicalizesEmail(): void
    {
        $this->userRepo->method('findByEmail')->willReturn(null);
        $this->passwordHasher->method('hashPassword')->willReturn('hashed-pw');
        $this->userRepo->expects($this->once())->method('persist')->with($this->isInstanceOf(User::class));
        $this->userRepo->expects($this->once())->method('flush');

        $user = $this->svc->register('Owner@DailyBrew.Work', self::FAKE_PW, 'Vandeth', 'Tho');

        $this->assertSame('Owner@DailyBrew.Work', $user->getEmail());
        $this->assertSame('owner@dailybrew.work', $user->getEmailCanonical());
        $this->assertSame('Vandeth', $user->getFirstName());
        $this->assertSame('Tho', $user->getLastName());
        $this->assertSame('hashed-pw', $user->getPassword());
    }

    // ── Google OAuth ──────────────────────────────────────────────────

    public function testFindOrCreateGoogleUserReturnsExistingUserWithMatchingGoogleId(): void
    {
        $existing = new User();
        $this->userRepo->method('findByGoogleId')->willReturn($existing);
        $this->userRepo->expects($this->never())->method('persist');

        $this->assertSame($existing, $this->svc->findOrCreateGoogleUser('google-id', 'a@x.com'));
    }

    public function testFindOrCreateGoogleUserRejectsWhenEmailTakenByDifferentAccount(): void
    {
        $this->userRepo->method('findByGoogleId')->willReturn(null);
        $this->userRepo->method('findByEmail')->willReturn(new User());

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('account with this email already exists');

        $this->svc->findOrCreateGoogleUser('google-id', 'taken@x.com');
    }

    public function testFindOrCreateGoogleUserCreatesNewUserWithGoogleIdSet(): void
    {
        $this->userRepo->method('findByGoogleId')->willReturn(null);
        $this->userRepo->method('findByEmail')->willReturn(null);
        $this->userRepo->expects($this->once())->method('persist');
        $this->userRepo->expects($this->once())->method('flush');

        $user = $this->svc->findOrCreateGoogleUser('google-id-123', 'New@Example.com');

        $this->assertSame('New@Example.com', $user->getEmail());
        $this->assertSame('new@example.com', $user->getEmailCanonical());
        $this->assertSame('google-id-123', $user->getGoogleId());
    }

    // ── Apple OAuth ───────────────────────────────────────────────────

    public function testFindOrCreateAppleUserReturnsExistingUserWithMatchingAppleId(): void
    {
        $existing = new User();
        $this->userRepo->method('findByAppleId')->willReturn($existing);
        $this->userRepo->expects($this->never())->method('persist');

        $this->assertSame($existing, $this->svc->findOrCreateAppleUser('apple-id', 'a@x.com'));
    }

    public function testFindOrCreateAppleUserCreatesNewUserWithAppleIdAndOptionalNames(): void
    {
        $this->userRepo->method('findByAppleId')->willReturn(null);
        $this->userRepo->method('findByEmail')->willReturn(null);
        $this->userRepo->expects($this->once())->method('persist');
        $this->userRepo->expects($this->once())->method('flush');

        $user = $this->svc->findOrCreateAppleUser('apple-id-x', 'jane@example.com', 'Jane', 'Doe');

        $this->assertSame('apple-id-x', $user->getAppleId());
        $this->assertSame('Jane', $user->getFirstName());
        $this->assertSame('Doe', $user->getLastName());
    }

    // ── Connect / disconnect Google ───────────────────────────────────

    public function testConnectGoogleRejectsWhenAlreadyLinkedToDifferentUser(): void
    {
        $other = $this->userWithId(99);
        $me = $this->userWithId(7);
        $this->userRepo->method('findByGoogleId')->willReturn($other);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('already linked to another user');

        $this->svc->connectGoogle($me, 'google-id-x');
    }

    public function testConnectGoogleAllowsRelinkingToSameUser(): void
    {
        $me = $this->userWithId(7);
        $this->userRepo->method('findByGoogleId')->willReturn($me);
        $this->userRepo->expects($this->once())->method('flush');

        $this->svc->connectGoogle($me, 'google-id-x');

        $this->assertSame('google-id-x', $me->getGoogleId());
    }

    public function testConnectGoogleSucceedsForUnusedId(): void
    {
        $me = $this->userWithId(7);
        $this->userRepo->method('findByGoogleId')->willReturn(null);
        $this->userRepo->expects($this->once())->method('flush');

        $this->svc->connectGoogle($me, 'google-id-x');

        $this->assertSame('google-id-x', $me->getGoogleId());
    }

    public function testDisconnectGoogleRejectsWhenNoAccountLinked(): void
    {
        $me = new User();

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('No Google account linked');

        $this->svc->disconnectGoogle($me);
    }

    public function testDisconnectGoogleRejectsWhenItIsTheOnlyLoginMethod(): void
    {
        $me = new User();
        $me->setGoogleId('google-id-x');
        // No password, no Apple — disconnecting Google leaves the user locked out.

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('only login method');

        $this->svc->disconnectGoogle($me);
    }

    public function testDisconnectGoogleSucceedsWhenPasswordLoginExists(): void
    {
        $me = new User();
        $me->setGoogleId('google-id-x');
        $me->setPassword('hashed');
        $this->userRepo->expects($this->once())->method('flush');

        $this->svc->disconnectGoogle($me);

        $this->assertNull($me->getGoogleId());
    }

    public function testDisconnectGoogleSucceedsWhenAppleLoginExists(): void
    {
        $me = new User();
        $me->setGoogleId('google-id-x');
        $me->setAppleId('apple-id-y');
        $this->userRepo->expects($this->once())->method('flush');

        $this->svc->disconnectGoogle($me);

        $this->assertNull($me->getGoogleId());
        $this->assertSame('apple-id-y', $me->getAppleId());
    }

    // ── Connect / disconnect Apple ────────────────────────────────────

    public function testConnectAppleRejectsWhenAlreadyLinkedToDifferentUser(): void
    {
        $other = $this->userWithId(99);
        $me = $this->userWithId(7);
        $this->userRepo->method('findByAppleId')->willReturn($other);

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('already linked to another user');

        $this->svc->connectApple($me, 'apple-id-x');
    }

    public function testDisconnectAppleRejectsWhenItIsTheOnlyLoginMethod(): void
    {
        $me = new User();
        $me->setAppleId('apple-id-x');

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('only login method');

        $this->svc->disconnectApple($me);
    }

    public function testDisconnectAppleSucceedsWhenAlternativeExists(): void
    {
        $me = new User();
        $me->setAppleId('apple-id-x');
        $me->setPassword('hashed');
        $this->userRepo->expects($this->once())->method('flush');

        $this->svc->disconnectApple($me);

        $this->assertNull($me->getAppleId());
    }

    private function userWithId(int $id): User
    {
        $user = new User();
        $ref = new \ReflectionClass($user);
        while ($ref !== false && !$ref->hasProperty('id')) {
            $ref = $ref->getParentClass();
        }
        $ref->getProperty('id')->setValue($user, $id);
        return $user;
    }

    // ── revokeRefreshToken ────────────────────────────────────────────

    public function testRevokeRefreshTokenDeletesTheRowWhenPresent(): void
    {
        $token = $this->createMock(RefreshTokenInterface::class);
        $this->refreshTokenManager->expects($this->once())->method('get')->with('valid-token')->willReturn($token);
        $this->refreshTokenManager->expects($this->once())->method('delete')->with($token);

        $this->svc->revokeRefreshToken('valid-token');
    }

    public function testRevokeRefreshTokenIsNoOpWhenTokenNotFound(): void
    {
        $this->refreshTokenManager->expects($this->once())->method('get')->with('stale-or-fake')->willReturn(null);
        $this->refreshTokenManager->expects($this->never())->method('delete');

        $this->svc->revokeRefreshToken('stale-or-fake');
    }

    public function testRevokeRefreshTokenIgnoresNullAndEmpty(): void
    {
        // Don't even hit the manager — avoids a DB round-trip for the common
        // case of mobile sending logout with cleared SecureStore.
        $this->refreshTokenManager->expects($this->never())->method('get');
        $this->refreshTokenManager->expects($this->never())->method('delete');

        $this->svc->revokeRefreshToken(null);
        $this->svc->revokeRefreshToken('');
    }
}
