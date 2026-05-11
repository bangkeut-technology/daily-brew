<?php

declare(strict_types=1);

namespace App\Enum;

/**
 * Controls how an employee is treated by the attendance system.
 *
 * `Full` is the default for every existing employee — counted as absent if
 * they don't check in, late/leftEarly flags fire when a shift is assigned.
 *
 * `None` is for staff who shouldn't be counted as absent (admin helpers, or
 * staff where the owner only wants raw arrival/departure times without
 * scheduling discipline). Check-in is still allowed — if they scan, the time
 * is recorded — but the dashboard absent calc and late/early flags ignore
 * them entirely.
 */
enum EmployeeAttendanceTrackingEnum: string
{
    case Full = 'full';
    case None = 'none';

    public function label(): string
    {
        return match ($this) {
            self::Full => 'Tracked (default)',
            self::None => 'Excluded from absent count',
        };
    }
}
