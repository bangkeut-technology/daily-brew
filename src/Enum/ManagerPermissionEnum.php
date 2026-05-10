<?php

declare(strict_types=1);

namespace App\Enum;

enum ManagerPermissionEnum: string
{
    case MANAGE_EMPLOYEES = 'manage_employees';
    case MANAGE_SHIFTS = 'manage_shifts';
    case MANAGE_CLOSURES = 'manage_closures';
    case MANAGE_LEAVE = 'manage_leave';
    case MANAGE_ATTENDANCE = 'manage_attendance';

    /** Permissions a newly-promoted manager (or back-filled existing manager) gets by default. */
    public static function defaults(): array
    {
        return [self::MANAGE_LEAVE, self::MANAGE_ATTENDANCE];
    }

    /** @return list<string> */
    public static function defaultValues(): array
    {
        return array_map(fn (self $p) => $p->value, self::defaults());
    }

    /** @param iterable<string|self> $input */
    public static function sanitize(iterable $input): array
    {
        $out = [];
        foreach ($input as $item) {
            $value = $item instanceof self ? $item : self::tryFrom((string) $item);
            if ($value !== null) {
                $out[$value->value] = $value;
            }
        }
        return array_values($out);
    }
}
