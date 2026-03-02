<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Attendance;
use App\Entity\LeaveRequest;
use App\Entity\User;
use App\Enum\AttendanceTypeEnum;
use App\Enum\LeaveRequestStatusEnum;
use App\Repository\AttendanceRepository;
use App\Repository\LeaveRequestRepository;
use DateTimeImmutable;

/**
 * Class LeaveRequestService
 *
 * @package App\Service
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
final readonly class LeaveRequestService
{
    public function __construct(
        private LeaveRequestRepository $leaveRequestRepository,
        private AttendanceRepository   $attendanceRepository,
    ) {
    }

    /**
     * Approve a leave request and generate attendance records for each working day.
     *
     * @param LeaveRequest $request
     * @param User         $reviewer
     * @param string|null  $note
     * @return void
     */
    public function approve(LeaveRequest $request, User $reviewer, ?string $note): void
    {
        $request->setStatus(LeaveRequestStatusEnum::APPROVED);
        $request->setReviewedBy($reviewer);
        $request->setReviewedAt(new DateTimeImmutable());
        $request->setReviewNote($note);

        $employee  = $request->getEmployee();
        $workspace = $request->getWorkspace();
        $current   = $request->getStartDate();
        $end       = $request->getEndDate();

        while ($current <= $end) {
            $dow = (int) $current->format('N'); // 1=Mon … 7=Sun
            if ($dow <= 5) {
                // Upsert: update existing record if present, otherwise create new.
                $attendance = $this->attendanceRepository->findByEmployeeAndDate($employee, $current);
                if (null === $attendance) {
                    $attendance = new Attendance();
                    $attendance->setEmployee($employee);
                    $attendance->setWorkspace($workspace);
                    $attendance->setAttendanceDate($current);
                }
                $attendance->setType(AttendanceTypeEnum::LEAVE);
                $attendance->setLeaveType($request->getType());
                $this->attendanceRepository->update($attendance, false);
            }
            $current = $current->modify('+1 day');
        }

        $this->leaveRequestRepository->update($request, false);
        $this->leaveRequestRepository->flush();
    }

    /**
     * Reject a leave request.
     *
     * @param LeaveRequest $request
     * @param User         $reviewer
     * @param string|null  $note
     * @return void
     */
    public function reject(LeaveRequest $request, User $reviewer, ?string $note): void
    {
        $request->setStatus(LeaveRequestStatusEnum::REJECTED);
        $request->setReviewedBy($reviewer);
        $request->setReviewedAt(new DateTimeImmutable());
        $request->setReviewNote($note);

        $this->leaveRequestRepository->update($request);
    }
}
