<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Entity\Employee;
use App\Entity\Subscription;
use App\Entity\User;
use App\Entity\Workspace;
use App\Enum\SubscriptionStatusEnum;
use App\Repository\SubscriptionRepository;
use App\Repository\WorkspaceRepository;
use App\Repository\WorkspaceSettingRepository;
use App\Service\WorkspaceService;
use Doctrine\Common\Collections\ArrayCollection;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\MockObject\Stub;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

#[AllowMockObjectsWithoutExpectations]
class WorkspaceServiceTest extends TestCase
{
    private WorkspaceRepository&MockObject $workspaceRepo;
    private WorkspaceSettingRepository&MockObject $settingRepo;
    private SubscriptionRepository&MockObject $subscriptionRepo;
    private HttpClientInterface&MockObject $httpClient;
    private LoggerInterface&Stub $logger;
    private WorkspaceService $svc;

    protected function setUp(): void
    {
        $this->workspaceRepo = $this->createMock(WorkspaceRepository::class);
        $this->settingRepo = $this->createMock(WorkspaceSettingRepository::class);
        $this->subscriptionRepo = $this->createMock(SubscriptionRepository::class);
        $this->httpClient = $this->createMock(HttpClientInterface::class);
        $this->logger = $this->createStub(LoggerInterface::class);

        $this->svc = new WorkspaceService(
            $this->workspaceRepo,
            $this->settingRepo,
            $this->subscriptionRepo,
            $this->httpClient,
            $this->logger,
            paddleApiKey: 'paddle-test-key',
            paddleEnvironment: 'sandbox',
        );
    }

    public function testCreateBuildsWorkspaceWithSettingAndSubscriptionAndSetsCurrentWorkspace(): void
    {
        $owner = new User();

        $this->workspaceRepo->expects($this->once())->method('persist')->with($this->isInstanceOf(Workspace::class));
        $this->settingRepo->expects($this->once())->method('persist');
        $this->subscriptionRepo->expects($this->once())->method('persist');
        $this->workspaceRepo->expects($this->once())->method('flush');

        $ws = $this->svc->create($owner, 'The Daily Grind');

        $this->assertSame($owner, $ws->getOwner());
        $this->assertSame('The Daily Grind', $ws->getName());
        $this->assertSame($ws, $owner->getCurrentWorkspace());
        $this->assertNotNull($ws->getSetting());
    }

    public function testCreateAppliesValidTimezone(): void
    {
        $this->workspaceRepo->expects($this->once())->method('flush');

        $ws = $this->svc->create(new User(), 'WS', 'Asia/Phnom_Penh');

        $this->assertSame('Asia/Phnom_Penh', $ws->getSetting()->getTimezone());
    }

    public function testCreateIgnoresInvalidTimezoneAndKeepsDefault(): void
    {
        $this->workspaceRepo->expects($this->once())->method('flush');

        $ws = $this->svc->create(new User(), 'WS', 'Not/A/Real_Zone');

        // Default timezone (set in WorkspaceSetting constructor) — only assert it's not the invalid one.
        $this->assertNotSame('Not/A/Real_Zone', $ws->getSetting()->getTimezone());
    }

    public function testUpdateRenamesAndFlushes(): void
    {
        $ws = (new Workspace())->setName('Old');
        $this->workspaceRepo->expects($this->once())->method('flush');

        $this->svc->update($ws, 'New');

        $this->assertSame('New', $ws->getName());
    }

    public function testDeleteSoftDeletesWorkspaceAndAllEmployees(): void
    {
        $ws = new Workspace();
        $emp1 = (new Employee())->setLinkedUser(new User());
        $emp2 = new Employee();
        $reflection = new \ReflectionClass($ws);
        $employeesProp = $reflection->getProperty('employees');
        $employeesProp->setValue($ws, new ArrayCollection([$emp1, $emp2]));

        $this->subscriptionRepo->method('findByWorkspace')->willReturn(null);
        $this->workspaceRepo->expects($this->once())->method('flush');

        $this->svc->delete($ws);

        $this->assertNotNull($ws->getDeletedAt());
        $this->assertNotNull($emp1->getDeletedAt());
        $this->assertNull($emp1->getLinkedUser());
        $this->assertNotNull($emp2->getDeletedAt());
    }

    public function testDeleteClearsOwnerCurrentWorkspaceWhenItPointsToTheDeletedOne(): void
    {
        // Regression guard — without this clearing, the owner's currentWorkspace
        // stays on a soft-deleted workspace and the next page load via
        // /users/me/role-context falls back to it, putting them back on the
        // dead workspace's dashboard.
        $ws = $this->workspaceWithId(7);
        $owner = $this->user(1);
        $owner->setCurrentWorkspace($ws);
        $ws->setOwner($owner);

        $this->subscriptionRepo->method('findByWorkspace')->willReturn(null);
        $this->workspaceRepo->expects($this->once())->method('flush');

        $this->svc->delete($ws);

        $this->assertNull($owner->getCurrentWorkspace());
    }

    public function testDeleteClearsLinkedUserCurrentWorkspaceWhenItMatches(): void
    {
        $ws = $this->workspaceWithId(7);
        $owner = $this->user(1);
        $ws->setOwner($owner);

        $linkedUser = $this->user(2);
        $linkedUser->setCurrentWorkspace($ws);
        $emp = (new Employee())->setLinkedUser($linkedUser);

        $reflection = new \ReflectionClass($ws);
        $reflection->getProperty('employees')->setValue($ws, new ArrayCollection([$emp]));

        $this->subscriptionRepo->method('findByWorkspace')->willReturn(null);
        $this->workspaceRepo->expects($this->once())->method('flush');

        $this->svc->delete($ws);

        $this->assertNull($linkedUser->getCurrentWorkspace());
    }

    public function testDeleteDoesNotClearOwnerCurrentWorkspacePointingToADifferentWorkspace(): void
    {
        $deleting = $this->workspaceWithId(7);
        $other = $this->workspaceWithId(8);
        $owner = $this->user(1);
        $owner->setCurrentWorkspace($other);
        $deleting->setOwner($owner);

        $this->subscriptionRepo->method('findByWorkspace')->willReturn(null);
        $this->workspaceRepo->expects($this->once())->method('flush');

        $this->svc->delete($deleting);

        $this->assertSame($other, $owner->getCurrentWorkspace());
    }

    private function user(int $id): User
    {
        $user = new User();
        $ref = new \ReflectionClass($user);
        while ($ref !== false && !$ref->hasProperty('id')) {
            $ref = $ref->getParentClass();
        }
        $ref->getProperty('id')->setValue($user, $id);
        return $user;
    }

    private function workspaceWithId(int $id): Workspace
    {
        $ws = new Workspace();
        $ref = new \ReflectionClass($ws);
        while ($ref !== false && !$ref->hasProperty('id')) {
            $ref = $ref->getParentClass();
        }
        $ref->getProperty('id')->setValue($ws, $id);
        return $ws;
    }

    public function testDeleteCancelsActivePaddleSubscriptionViaApi(): void
    {
        $ws = new Workspace();
        $sub = (new Subscription())
            ->setStatus(SubscriptionStatusEnum::Active)
            ->setPaddleSubscriptionId('sub_paddle_123');
        $this->subscriptionRepo->method('findByWorkspace')->willReturn($sub);

        $this->httpClient->expects($this->once())
            ->method('request')
            ->with(
                'POST',
                'https://sandbox-api.paddle.com/subscriptions/sub_paddle_123/cancel',
                $this->callback(fn (array $opts) =>
                    ($opts['headers']['Authorization'] ?? null) === 'Bearer paddle-test-key'
                    && ($opts['json']['effective_from'] ?? null) === 'immediately'
                ),
            );
        $this->workspaceRepo->expects($this->once())->method('flush');

        $this->svc->delete($ws);

        $this->assertSame(SubscriptionStatusEnum::Canceled, $sub->getStatus());
        $this->assertNotNull($ws->getDeletedAt());
    }

    public function testDeleteSwallowsPaddleApiFailure(): void
    {
        $ws = new Workspace();
        $sub = (new Subscription())
            ->setStatus(SubscriptionStatusEnum::Active)
            ->setPaddleSubscriptionId('sub_paddle_123');
        $this->subscriptionRepo->method('findByWorkspace')->willReturn($sub);
        $this->httpClient->method('request')->willThrowException(new \RuntimeException('Paddle is down'));
        $this->workspaceRepo->expects($this->once())->method('flush');

        // Must NOT throw — Paddle outage cannot block local workspace deletion.
        $this->svc->delete($ws);

        // Subscription is still marked canceled locally even when API fails.
        $this->assertSame(SubscriptionStatusEnum::Canceled, $sub->getStatus());
        $this->assertNotNull($ws->getDeletedAt());
    }

    public function testDeleteDoesNotCancelInactiveSubscription(): void
    {
        $ws = new Workspace();
        $sub = (new Subscription())->setStatus(SubscriptionStatusEnum::Canceled);
        $this->subscriptionRepo->method('findByWorkspace')->willReturn($sub);
        $this->httpClient->expects($this->never())->method('request');
        $this->workspaceRepo->expects($this->once())->method('flush');

        $this->svc->delete($ws);

        // Already canceled — status stays canceled, no Paddle call.
        $this->assertSame(SubscriptionStatusEnum::Canceled, $sub->getStatus());
    }

    public function testForceCancelSubscriptionIsNoOpOnAlreadyCanceled(): void
    {
        $sub = (new Subscription())->setStatus(SubscriptionStatusEnum::Canceled);
        $this->httpClient->expects($this->never())->method('request');
        $this->subscriptionRepo->expects($this->never())->method('flush');

        $this->svc->forceCancelSubscription($sub);
    }

    public function testForceCancelSubscriptionCallsPaddleAndFlushesWhenActive(): void
    {
        $sub = (new Subscription())
            ->setStatus(SubscriptionStatusEnum::Active)
            ->setPaddleSubscriptionId('sub_x');
        $this->httpClient->expects($this->once())->method('request');
        $this->subscriptionRepo->expects($this->once())->method('flush');

        $this->svc->forceCancelSubscription($sub);

        $this->assertSame(SubscriptionStatusEnum::Canceled, $sub->getStatus());
    }

    public function testForceCancelSubscriptionWithoutPaddleIdSkipsHttpButCancelsLocally(): void
    {
        $sub = (new Subscription())->setStatus(SubscriptionStatusEnum::Active);
        $this->httpClient->expects($this->never())->method('request');
        $this->subscriptionRepo->expects($this->once())->method('flush');

        $this->svc->forceCancelSubscription($sub);

        $this->assertSame(SubscriptionStatusEnum::Canceled, $sub->getStatus());
    }
}
