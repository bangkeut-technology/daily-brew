<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Entity\Employee;
use App\Entity\User;
use App\Entity\Workspace;
use App\Entity\WorkspaceQrCode;
use App\Repository\EmployeeRepository;
use App\Repository\WorkspaceQrCodeRepository;
use App\Service\PlanService;
use App\Service\WorkspaceQrCodeService;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\MockObject\Stub;
use PHPUnit\Framework\TestCase;

#[AllowMockObjectsWithoutExpectations]
class WorkspaceQrCodeServiceTest extends TestCase
{
    private WorkspaceQrCodeRepository&MockObject $qrRepo;
    private EmployeeRepository&Stub $employeeRepo;
    private PlanService&Stub $planService;
    private WorkspaceQrCodeService $svc;

    protected function setUp(): void
    {
        $this->qrRepo = $this->createMock(WorkspaceQrCodeRepository::class);
        $this->employeeRepo = $this->createStub(EmployeeRepository::class);
        $this->planService = $this->createStub(PlanService::class);
        // Default: feature available — individual tests override.
        $this->planService->method('canUseSubQrCodes')->willReturn(true);

        $this->svc = new WorkspaceQrCodeService($this->qrRepo, $this->employeeRepo, $this->planService);
    }

    public function testCreateRejectsWhenPlanDoesNotSupportSubQrCodes(): void
    {
        $this->planService = $this->createStub(PlanService::class);
        $this->planService->method('canUseSubQrCodes')->willReturn(false);
        $this->svc = new WorkspaceQrCodeService($this->qrRepo, $this->employeeRepo, $this->planService);

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Double Espresso plan');

        $this->svc->create($this->workspace(1), ['name' => 'Bar']);
    }

    public function testCreateRejectsBlankName(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('QR code name is required');

        $this->svc->create($this->workspace(1), ['name' => '   ']);
    }

    public function testCreatePersistsMinimalQrCode(): void
    {
        $workspace = $this->workspace(1);
        $this->qrRepo->expects($this->once())->method('persist');
        $this->qrRepo->expects($this->once())->method('flush');

        $qr = $this->svc->create($workspace, ['name' => 'Bar']);

        $this->assertSame('Bar', $qr->getName());
        $this->assertSame($workspace, $qr->getWorkspace());
        $this->assertNull($qr->getManager());
        $this->assertCount(0, $qr->getAssignedEmployees());
    }

    public function testCreateRejectsManagerFromDifferentWorkspace(): void
    {
        $workspace = $this->workspace(1);
        $otherWorkspace = $this->workspace(2);
        $foreignManager = $this->employee($otherWorkspace, withLinkedUser: true);
        $this->employeeRepo->method('findByPublicId')->willReturn($foreignManager);

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('employee of this workspace');

        $this->svc->create($workspace, ['name' => 'Bar', 'managerPublicId' => 'manager-pub-id']);
    }

    public function testCreateRejectsManagerWithoutLinkedUser(): void
    {
        $workspace = $this->workspace(1);
        $unlinkedManager = $this->employee($workspace, withLinkedUser: false);
        $this->employeeRepo->method('findByPublicId')->willReturn($unlinkedManager);

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('linked user account');

        $this->svc->create($workspace, ['name' => 'Bar', 'managerPublicId' => 'manager-pub-id']);
    }

    public function testCreateAssignsManagerWhenValid(): void
    {
        $workspace = $this->workspace(1);
        $manager = $this->employee($workspace, withLinkedUser: true);
        $this->employeeRepo->method('findByPublicId')->willReturn($manager);
        $this->qrRepo->expects($this->once())->method('persist');
        $this->qrRepo->expects($this->once())->method('flush');

        $qr = $this->svc->create($workspace, ['name' => 'Bar', 'managerPublicId' => 'manager-pub-id']);

        $this->assertSame($manager, $qr->getManager());
    }

    public function testCreateRejectsAssignedEmployeeFromDifferentWorkspace(): void
    {
        $workspace = $this->workspace(1);
        $otherWorkspace = $this->workspace(2);
        $foreignEmployee = $this->employee($otherWorkspace, withLinkedUser: false);
        $this->employeeRepo->method('findByPublicId')->willReturn($foreignEmployee);

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Assigned employees must belong to this workspace');

        $this->svc->create($workspace, [
            'name' => 'Bar',
            'assignedEmployeePublicIds' => ['emp-pub-id'],
        ]);
    }

    public function testCreateRejectsNonArrayAssignmentList(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('assignedEmployeePublicIds must be an array');

        $this->svc->create($this->workspace(1), [
            'name' => 'Bar',
            'assignedEmployeePublicIds' => 'not-an-array',
        ]);
    }

    public function testCreateAddsAssignedEmployeesWhenAllValid(): void
    {
        $workspace = $this->workspace(1);
        $emp1 = $this->employee($workspace, withLinkedUser: false);
        $emp2 = $this->employee($workspace, withLinkedUser: false);
        $this->employeeRepo->method('findByPublicId')->willReturnOnConsecutiveCalls($emp1, $emp2);
        $this->qrRepo->expects($this->once())->method('persist');

        $qr = $this->svc->create($workspace, [
            'name' => 'Bar',
            'assignedEmployeePublicIds' => ['emp-1', 'emp-2'],
        ]);

        $this->assertTrue($qr->getAssignedEmployees()->contains($emp1));
        $this->assertTrue($qr->getAssignedEmployees()->contains($emp2));
    }

    public function testCreateClampsGeofenceRadiusToFiftyMeterFloor(): void
    {
        $workspace = $this->workspace(1);
        $this->qrRepo->expects($this->once())->method('persist');

        $qr = $this->svc->create($workspace, [
            'name' => 'Bar',
            'inheritGeofencing' => false,
            'geofencingEnabled' => true,
            'geofencingLatitude' => 11.55,
            'geofencingLongitude' => 104.9,
            'geofencingRadiusMeters' => 10,
        ]);

        $this->assertSame(50, $qr->getGeofencingRadiusMeters());
    }

    public function testUpdateThrowsWhenQrIsDetachedFromWorkspace(): void
    {
        $qr = new WorkspaceQrCode();
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('not attached to a workspace');

        $this->svc->update($qr, ['name' => 'Renamed']);
    }

    public function testUpdateAppliesOnlyFieldsPresentInPayload(): void
    {
        $workspace = $this->workspace(1);
        $qr = (new WorkspaceQrCode())
            ->setWorkspace($workspace)
            ->setName('Original')
            ->setInheritIpSettings(true);

        $this->qrRepo->expects($this->once())->method('flush');

        $result = $this->svc->update($qr, ['name' => 'Renamed']);

        $this->assertSame('Renamed', $result->getName());
        // inheritIpSettings should be untouched (no key in payload).
        $this->assertTrue($result->isInheritIpSettings());
    }

    public function testUpdateRejectsBlankName(): void
    {
        $qr = (new WorkspaceQrCode())->setWorkspace($this->workspace(1));

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('QR code name cannot be empty');

        $this->svc->update($qr, ['name' => '   ']);
    }

    public function testUpdateClearsManagerWhenManagerPublicIdIsNull(): void
    {
        $workspace = $this->workspace(1);
        $existingManager = $this->employee($workspace, withLinkedUser: true);
        $qr = (new WorkspaceQrCode())->setWorkspace($workspace)->setManager($existingManager);

        $this->qrRepo->expects($this->once())->method('flush');

        $result = $this->svc->update($qr, ['managerPublicId' => null]);

        $this->assertNull($result->getManager());
    }

    public function testDeleteDelegatesToRepository(): void
    {
        $qr = new WorkspaceQrCode();
        $this->qrRepo->expects($this->once())->method('delete')->with($qr);

        $this->svc->delete($qr);
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private function workspace(int $id): Workspace
    {
        $w = new Workspace();
        $this->setEntityId($w, $id);
        return $w;
    }

    private function employee(Workspace $workspace, bool $withLinkedUser): Employee
    {
        $emp = new Employee();
        $emp->setWorkspace($workspace);
        if ($withLinkedUser) {
            $emp->setLinkedUser(new User());
        }
        return $emp;
    }

    private function setEntityId(object $entity, int $id): void
    {
        $ref = new \ReflectionClass($entity);
        while ($ref !== false && !$ref->hasProperty('id')) {
            $ref = $ref->getParentClass();
        }
        if ($ref === false) {
            throw new \LogicException('No id property on ' . get_class($entity));
        }
        $ref->getProperty('id')->setValue($entity, $id);
    }
}
