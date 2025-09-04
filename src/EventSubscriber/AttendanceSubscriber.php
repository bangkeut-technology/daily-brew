<?php
declare(strict_types=1);

namespace App\EventSubscriber;

use App\Constant\SettingConstant;
use App\Enum\AttendanceStatusEnum;
use App\Enum\LeaveTypeEnum;
use App\Event\Attendance\AttendanceCreatedEvent;
use App\Repository\AttendanceRepository;
use App\Service\SettingService;
use App\Util\DateHelper;
use DateMalformedStringException;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Class AttendanceSubscriber
 *
 * @package App\EventSubscriber
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
readonly class AttendanceSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private SettingService       $settingService,
        private AttendanceRepository $attendanceRepository,
    )
    {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            AttendanceCreatedEvent::class => 'onAttendanceCreated',
        ];
    }

    /**
     * @throws DateMalformedStringException
     */
    public function onAttendanceCreated(AttendanceCreatedEvent $event): void
    {
        $attendance = $event->attendance;
        if ($attendance->getLeaveType() !== null || $attendance->getStatus() !== AttendanceStatusEnum::LEAVE) {
            return; // Skip if already has leaveType or not absent
        }

        $user = $attendance->getUser();

        $paidLeaveLimit = $this->settingService->getInt(SettingConstant::NUMBER_OF_PAID_LEAVE, 3);
        $cycle = $this->settingService->getString(SettingConstant::PAID_LEAVE_CYCLE, 'monthly');


        $date = $attendance->getAttendanceDate();
        [$start, $end] = $cycle === 'yearly'
            ? [DateHelper::startOfYear($date), DateHelper::endOfYear($date)]
            : [DateHelper::startOfMonth($date), DateHelper::endOfMonth($date)];

        $usedPaidLeaves = $this->attendanceRepository->countPaidLeavesBetween($user, $start, $end);

        $leaveType = $usedPaidLeaves < $paidLeaveLimit ? LeaveTypeEnum::PAID : LeaveTypeEnum::UNPAID;
        $attendance->setLeaveType($leaveType);

        $this->attendanceRepository->update($attendance);
    }
}
