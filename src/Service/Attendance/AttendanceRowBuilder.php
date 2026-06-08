<?php

declare(strict_types=1);

namespace App\Service\Attendance;

use App\Entity\Employee;
use App\Entity\Workspace;
use App\Enum\DayOfWeekEnum;
use App\Repository\AttendanceRepository;
use App\Repository\ClosurePeriodRepository;
use App\Repository\LeaveRequestRepository;
use App\Service\DateService;
use App\Service\PlanService;

/**
 * Builds the per-(employee, date) row list that powers the attendance log
 * view and exports. Each row is one of: present, absent, on_leave. Closures
 * and future days are omitted. Pre-link days are skipped to match the absent
 * baseline anchored by Employee.linkedAt.
 *
 * Extracted from AttendanceController::list() so the export endpoints can
 * reuse the same shape — the bug fix in PR 265 carries through automatically.
 */
class AttendanceRowBuilder
{
    public function __construct(
        private AttendanceRepository $attendanceRepository,
        private LeaveRequestRepository $leaveRequestRepository,
        private ClosurePeriodRepository $closurePeriodRepository,
        private PlanService $planService,
    ) {}

    /**
     * @param Employee[] $employees pre-scoped by the caller (owner/manager → all,
     *                              else self-only)
     *
     * @return list<array<string, mixed>>
     */
    public function build(
        Workspace $workspace,
        array $employees,
        \DateTimeImmutable $from,
        \DateTimeImmutable $to,
    ): array {
        if (empty($employees)) {
            return [];
        }

        $wsTz = new \DateTimeZone($workspace->getSetting()?->getTimezone() ?? 'UTC');
        $wsTodayStr = DateService::today($wsTz)->format('Y-m-d');

        $attendances = $this->attendanceRepository->findByWorkspaceAndDateRange(
            $workspace,
            DateService::mutableParse($from->format('Y-m-d')),
            DateService::mutableParse($to->format('Y-m-d')),
        );

        $approvedLeaves = $this->leaveRequestRepository->findApprovedByWorkspaceAndDateRange(
            $workspace,
            $from,
            $to,
        );

        $closures = $this->closurePeriodRepository->findAllOverlappingRange(
            $workspace,
            $from,
            $to,
        );

        $formatTime = static function (?\DateTimeInterface $dt) use ($wsTz): ?string {
            if ($dt === null) {
                return null;
            }
            return \DateTimeImmutable::createFromInterface($dt)->setTimezone($wsTz)->format('H:i');
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

        // Per-day rules are an Espresso+ feature — short-circuit the check so
        // the rest of the loop stays plain-array work.
        $perDayRulesActive = $this->planService->canUseShiftTimeRules($workspace);

        $result = [];
        $datePeriod = new \DatePeriod($from, new \DateInterval('P1D'), $to->modify('+1 day'));

        foreach ($datePeriod as $date) {
            $dateStr = $date->format('Y-m-d');
            $isClosure = isset($closureDates[$dateStr]);
            $isFuture = $dateStr > $wsTodayStr;
            $dayOfWeek = DayOfWeekEnum::tryFrom((int) $date->format('N'));

            foreach ($employees as $emp) {
                $leftAt = $emp->getLeftAt()?->format('Y-m-d');
                if ($leftAt !== null && $dateStr > $leftAt) {
                    continue;
                }

                $linkedAt = $emp->getLinkedAt()?->format('Y-m-d');
                if ($linkedAt === null || $dateStr < $linkedAt) {
                    continue;
                }

                // Off-day skip: an employee with a per-day-ruled shift is not
                // expected on days outside their schedule. We don't emit an
                // absent row, but a real check-in (someone came in unexpectedly)
                // still surfaces below as 'present'.
                $shift = $emp->getShift();
                $isOffDay = $perDayRulesActive
                    && $shift !== null
                    && $shift->hasAnyTimeRules()
                    && $dayOfWeek !== null
                    && !$shift->isScheduledOn($dayOfWeek);

                $key = $emp->getId() . '_' . $dateStr;

                if ($isOffDay && !isset($attendanceMap[$key])) {
                    continue;
                }

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
                        'isLate' => $a->isLate() && !$a->isVoided(),
                        'leftEarly' => $a->hasLeftEarly() && !$a->isVoided(),
                        // Voided rows still surface in the list (with badge) so
                        // managers can see why a day disappeared; dashboard stats
                        // and the BasilBook export drop them at the query layer.
                        'status' => $a->isVoided() ? 'voided' : 'present',
                        'editedAt' => $a->getEditedAt()?->format(\DateTimeInterface::ATOM),
                        'editedByEmail' => $a->getEditedByEmail(),
                        'editReason' => $a->getEditReason(),
                        'originalCheckInAt' => $formatTime($a->getOriginalCheckInAt()),
                        'originalCheckOutAt' => $formatTime($a->getOriginalCheckOutAt()),
                        'voidedAt' => $a->getVoidedAt()?->format(\DateTimeInterface::ATOM),
                        'voidedByEmail' => $a->getVoidedByEmail(),
                        'voidReason' => $a->getVoidReason(),
                    ];
                } elseif (!$isClosure && !$isFuture) {
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

        return $result;
    }

    /**
     * Apply the standard list sort: date DESC, status (present > on_leave >
     * absent), then employee name ASC. Kept out of build() so exports can
     * choose a different order (e.g. date ASC for chronological reports).
     *
     * @param list<array<string, mixed>> $rows
     *
     * @return list<array<string, mixed>>
     */
    public static function sortByDateDescStatusName(array $rows): array
    {
        $statusOrder = ['present' => 0, 'on_leave' => 1, 'absent' => 2, 'voided' => 3];
        usort($rows, static function (array $a, array $b) use ($statusOrder): int {
            $dateCmp = $b['date'] <=> $a['date'];
            if ($dateCmp !== 0) {
                return $dateCmp;
            }
            $statusCmp = ($statusOrder[$a['status']] ?? 3) <=> ($statusOrder[$b['status']] ?? 3);
            if ($statusCmp !== 0) {
                return $statusCmp;
            }
            return $a['employeeName'] <=> $b['employeeName'];
        });
        return $rows;
    }
}
