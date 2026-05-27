<?php

declare(strict_types=1);

namespace App\Tests\Unit\Service;

use App\Entity\Attendance;
use App\Entity\Employee;
use App\Entity\Workspace;
use App\Repository\AttendanceRepository;
use App\Service\AttendanceAnomalyDetector;
use App\Service\NotificationService;
use App\Service\PlanService;
use PHPUnit\Framework\TestCase;

class AttendanceAnomalyDetectorTest extends TestCase
{
    private AttendanceRepository $repo;
    private PlanService $planService;
    private NotificationService $notifier;
    private AttendanceAnomalyDetector $detector;
    private Attendance $attendance;

    protected function setUp(): void
    {
        // Stubs: we only feed return values. Mock: we verify calls on the notifier.
        $this->repo = $this->createStub(AttendanceRepository::class);
        $this->planService = $this->createStub(PlanService::class);
        $this->planService->method('canUseAnomalyDetection')->willReturn(true);
        $this->notifier = $this->createMock(NotificationService::class);

        $this->detector = new AttendanceAnomalyDetector($this->repo, $this->planService, $this->notifier);

        $this->attendance = (new Attendance())
            ->setEmployee(new Employee())
            ->setWorkspace(new Workspace());
    }

    public function testFirstEverDeviceIsBaselineAndDoesNotNotify(): void
    {
        $this->repo->method('findKnownDeviceIds')->willReturn([]);
        $this->notifier->expects($this->never())->method('notifyDeviceAnomaly');

        $this->detector->handle($this->attendance, 'in', 'device-A');
    }

    public function testKnownDeviceDoesNotNotify(): void
    {
        $this->repo->method('findKnownDeviceIds')->willReturn(['device-A', 'device-B']);
        $this->notifier->expects($this->never())->method('notifyDeviceAnomaly');

        $this->detector->handle($this->attendance, 'in', 'device-A');
    }

    public function testNewDeviceCheckInNotifies(): void
    {
        $this->repo->method('findKnownDeviceIds')->willReturn(['device-A']);
        $this->notifier->expects($this->once())
            ->method('notifyDeviceAnomaly')
            ->with($this->attendance, 'in');

        $this->detector->handle($this->attendance, 'in', 'device-NEW');
    }

    public function testNewDeviceCheckOutNotifies(): void
    {
        $this->attendance->setCheckInDeviceId('device-A');
        $this->repo->method('findKnownDeviceIds')->willReturn(['device-A']);
        $this->notifier->expects($this->once())
            ->method('notifyDeviceAnomaly')
            ->with($this->attendance, 'out');

        $this->detector->handle($this->attendance, 'out', 'device-NEW');
    }

    public function testCheckOutFromSameDeviceAsCheckInDoesNotNotify(): void
    {
        // First-ever day: no prior history, check in + out on the same new device.
        $this->attendance->setCheckInDeviceId('device-A');
        $this->repo->method('findKnownDeviceIds')->willReturn([]);
        $this->notifier->expects($this->never())->method('notifyDeviceAnomaly');

        $this->detector->handle($this->attendance, 'out', 'device-A');
    }

    public function testNonEspressoDoesNotNotify(): void
    {
        $planService = $this->createStub(PlanService::class);
        $planService->method('canUseAnomalyDetection')->willReturn(false);
        $detector = new AttendanceAnomalyDetector($this->repo, $planService, $this->notifier);

        $this->notifier->expects($this->never())->method('notifyDeviceAnomaly');

        $detector->handle($this->attendance, 'in', 'device-NEW');
    }

    public function testNullDeviceDoesNotNotify(): void
    {
        $this->notifier->expects($this->never())->method('notifyDeviceAnomaly');

        $this->detector->handle($this->attendance, 'in', null);
    }
}
