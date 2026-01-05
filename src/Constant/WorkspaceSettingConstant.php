<?php
declare(strict_types=1);

namespace App\Constant;

/**
 * Class WorkspaceSettingConstant
 *
 * @package App\Constant
 * @author Vandeth THO <thovandeth@gmail.com>
 */
final class WorkspaceSettingConstant extends AbstractConstant
{
    public const string NUMBER_OF_PAID_LEAVE = 'number_of_paid_leave';
    public const string PAID_LEAVE_CYCLE = 'paid_leave_cycle';
    public const string MAXIMUM_LATE_COUNT = 'maximum_late_count';

    /**
     * Default values for each configuration constant
     */
    private static array $defaultValues = [
        self::NUMBER_OF_PAID_LEAVE => 2,
        self::PAID_LEAVE_CYCLE => 'monthly',
        self::MAXIMUM_LATE_COUNT => 3,
    ];

    /**
     * Static method to return constants along with their default values
     */
    public static function getConstantsWithDefaults(): array
    {
        return self::$defaultValues;
    }

    /**
     * Static method to get the default value for a specific constant
     */
    public static function getDefaultValue(string $constant): mixed
    {
        return self::$defaultValues[$constant] ?? null;
    }
}
