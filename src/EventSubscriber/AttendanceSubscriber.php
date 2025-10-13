<?php
declare(strict_types=1);

namespace App\EventSubscriber;

use App\Constant\SettingConstant;
use App\Enum\AttendanceTypeEnum;
use App\Enum\LeaveTypeEnum;
use App\Event\Attendance\RebalanceLeaveCycleEvent;
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

    /**
     * @inheritDoc
     */
    public static function getSubscribedEvents(): array
    {
        return [
            RebalanceLeaveCycleEvent::class => 'onRebalanceCycle',
        ];
    }

    /**
     * Adjusts the leave cycle for an employee based on a defined anchor date and cycle settings.
     *
     * The method applies a limit to the number of paid leaves allowed and adjusts the leave types
     * (paid or unpaid) for a given time window (monthly or yearly) according to the cycle configuration.
     *
     * @param RebalanceLeaveCycleEvent $event
     * @return void
     * @throws DateMalformedStringException
     */
    public function onRebalanceCycle(RebalanceLeaveCycleEvent $event): void
    {
        $attendance = $event->attendance;
        if ($attendance->getType() !== AttendanceTypeEnum::LEAVE) {
            return;
        }

        $limit = $this->settingService->getInt(SettingConstant::NUMBER_OF_PAID_LEAVE, 3);
        $cycle = $this->settingService->getString(SettingConstant::PAID_LEAVE_CYCLE, 'monthly');
        $attendanceDate = $attendance->getAttendanceDate();

        [$start, $end] = $cycle === 'yearly'
            ? [DateHelper::startOfYear($attendanceDate), DateHelper::endOfYear($attendanceDate)]
            : [DateHelper::startOfMonth($attendanceDate), DateHelper::endOfMonth($attendanceDate)];

        $leaves = $this->attendanceRepository->findType($attendance->getEmployee(), $start, $end, AttendanceTypeEnum::LEAVE);

        foreach ($leaves as $i => $leave) {
            $shouldBe = ($i < $limit) ? LeaveTypeEnum::PAID : LeaveTypeEnum::UNPAID;
            if ($leave->getLeaveType() !== $shouldBe) {
                $leave->setLeaveType($shouldBe);
            }
        }

        $this->attendanceRepository->flush();
    }
}
