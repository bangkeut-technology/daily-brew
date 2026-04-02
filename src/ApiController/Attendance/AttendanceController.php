<?php

namespace App\ApiController\Attendance;

use App\ApiController\Trait\ApiResponseTrait;
use App\Entity\User;
use App\Repository\AttendanceRepository;
use App\Repository\ClosurePeriodRepository;
use App\Repository\EmployeeRepository;
use App\Repository\LeaveRequestRepository;
use App\Repository\WorkspaceRepository;
use App\Security\Voter\WorkspaceVoter;
use App\Service\DateService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/workspaces/{workspacePublicId}/attendances')]
class AttendanceController extends AbstractController
{
    use ApiResponseTrait;

    #[Route('', name: 'attendances_list', methods: ['GET'])]
    public function list(
        string $workspacePublicId,
        Request $request,
        #[CurrentUser] User $user,
        WorkspaceRepository $workspaceRepository,
        AttendanceRepository $attendanceRepository,
        EmployeeRepository $employeeRepository,
        LeaveRequestRepository $leaveRequestRepository,
        ClosurePeriodRepository $closurePeriodRepository,
    ): JsonResponse {
        $workspace = $workspaceRepository->findByPublicId($workspacePublicId);
        if ($workspace === null) {
            throw new NotFoundHttpException('Workspace not found');
        }

        $this->denyAccessUnlessGranted(WorkspaceVoter::VIEW, $workspace);

        $wsTz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');
        $from = $request->query->get('from', DateService::today($wsTz)->format('Y-m-d'));
        $to = $request->query->get('to', $from);
        $wsTodayStr = DateService::today($wsTz)->format('Y-m-d');

        $fromDate = DateService::parse($from);
        $toDate = DateService::parse($to);

        // Determine role
        $isOwner = $workspace->getOwner()?->getId() === $user->getId();
        $employee = $employeeRepository->findOneByLinkedUserAndWorkspace($user, $workspace);
        $isManager = $employee?->isManager() ?? false;

        // Load active employees (filtered for non-owner/non-manager)
        $activeEmployees = $employeeRepository->findActiveByWorkspace($workspace);
        if (!$isOwner && !$isManager && $employee !== null) {
            $empId = $employee->getId();
            $activeEmployees = array_filter($activeEmployees, fn ($e) => $e->getId() === $empId);
        }

        // Bulk-load attendance, leaves, and closures
        $attendances = $attendanceRepository->findByWorkspaceAndDateRange(
            $workspace,
            DateService::mutableParse($from),
            DateService::mutableParse($to),
        );

        $approvedLeaves = $leaveRequestRepository->findApprovedByWorkspaceAndDateRange(
            $workspace, $fromDate, $toDate,
        );

        $closures = $closurePeriodRepository->findAllOverlappingRange(
            $workspace, $fromDate, $toDate,
        );

        // Time formatter
        $tz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');
        $formatTime = static function (?\DateTimeInterface $dt) use ($tz): ?string {
            if ($dt === null) return null;
            return \DateTimeImmutable::createFromInterface($dt)->setTimezone($tz)->format('H:i');
        };

        // Index attendance by "employeeId_date"
        $attendanceMap = [];
        foreach ($attendances as $a) {
            $key = $a->getEmployee()->getId() . '_' . $a->getDate()->format('Y-m-d');
            $attendanceMap[$key] = $a;
        }

        // Build closure dates set
        $closureDates = [];
        foreach ($closures as $c) {
            $period = new \DatePeriod(
                \DateTimeImmutable::createFromInterface($c->getStartDate()),
                new \DateInterval('P1D'),
                \DateTimeImmutable::createFromInterface($c->getEndDate())->modify('+1 day'),
            );
            foreach ($period as $d) {
                $closureDates[$d->format('Y-m-d')] = true;
            }
        }

        // Index leaves by employee ID
        $leaveMap = [];
        foreach ($approvedLeaves as $lr) {
            $leaveMap[$lr->getEmployee()->getId()][] = $lr;
        }

        // Build result with present, absent, and on_leave records
        $result = [];
        $datePeriod = new \DatePeriod($fromDate, new \DateInterval('P1D'), $toDate->modify('+1 day'));

        foreach ($datePeriod as $date) {
            $dateStr = $date->format('Y-m-d');
            $isClosure = isset($closureDates[$dateStr]);
            $isFuture = $dateStr > $wsTodayStr;

            foreach ($activeEmployees as $emp) {
                $key = $emp->getId() . '_' . $dateStr;

                if (isset($attendanceMap[$key])) {
                    $a = $attendanceMap[$key];
                    $result[] = [
                        'publicId' => (string) $a->getPublicId(),
                        'employeePublicId' => (string) $emp->getPublicId(),
                        'employeeName' => $emp->getName(),
                        'shiftName' => $emp->getShift()?->getName(),
                        'date' => $dateStr,
                        'checkInAt' => $formatTime($a->getCheckInAt()),
                        'checkOutAt' => $formatTime($a->getCheckOutAt()),
                        'isLate' => $a->isLate(),
                        'leftEarly' => $a->hasLeftEarly(),
                        'status' => 'present',
                    ];
                } elseif (!$isClosure && !$isFuture) {
                    // Check if on approved leave
                    $onLeave = false;
                    $empLeaves = $leaveMap[$emp->getId()] ?? [];
                    foreach ($empLeaves as $lr) {
                        if ($lr->getStartDate()->format('Y-m-d') <= $dateStr
                            && $lr->getEndDate()->format('Y-m-d') >= $dateStr) {
                            $onLeave = true;
                            break;
                        }
                    }

                    $status = $onLeave ? 'on_leave' : 'absent';
                    $result[] = [
                        'publicId' => $status . '-' . $emp->getPublicId() . '-' . $dateStr,
                        'employeePublicId' => (string) $emp->getPublicId(),
                        'employeeName' => $emp->getName(),
                        'shiftName' => $emp->getShift()?->getName(),
                        'date' => $dateStr,
                        'checkInAt' => null,
                        'checkOutAt' => null,
                        'isLate' => false,
                        'leftEarly' => false,
                        'status' => $status,
                    ];
                }
            }
        }

        // Sort: date DESC, then status (present > on_leave > absent), then name ASC
        $statusOrder = ['present' => 0, 'on_leave' => 1, 'absent' => 2];
        usort($result, static function (array $a, array $b) use ($statusOrder): int {
            $dateCmp = $b['date'] <=> $a['date'];
            if ($dateCmp !== 0) return $dateCmp;
            $statusCmp = ($statusOrder[$a['status']] ?? 3) <=> ($statusOrder[$b['status']] ?? 3);
            if ($statusCmp !== 0) return $statusCmp;
            return $a['employeeName'] <=> $b['employeeName'];
        });

        return $this->jsonSuccess($result);
    }
}
