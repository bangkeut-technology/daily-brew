<?php

declare(strict_types=1);

namespace App\Exception;

use App\Entity\Attendance;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

/**
 * Thrown when a manual attendance entry collides with the (employee, date)
 * unique constraint. Carries the existing row so the caller can offer to edit
 * it instead of creating a duplicate.
 */
final class AttendanceAlreadyExistsException extends ConflictHttpException
{
    public function __construct(public readonly Attendance $existing)
    {
        parent::__construct('An attendance record already exists for this employee on this date.');
    }
}
