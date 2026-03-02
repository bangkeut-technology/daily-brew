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

    public const string KPI_PASSING_SCORE           = 'kpi_passing_score';
    public const string KPI_EVALUATION_FREQUENCY    = 'kpi_evaluation_frequency';
    public const string KPI_WEIGHT_ATTENDANCE       = 'kpi_weight_attendance';
    public const string KPI_WEIGHT_EVALUATION       = 'kpi_weight_evaluation';

    public const string PAYROLL_CURRENCY            = 'payroll_currency';
    public const string PAYROLL_WORK_DAYS_PER_MONTH = 'payroll_work_days_per_month';
    public const string LATE_DEDUCTION_ENABLED      = 'late_deduction_enabled';
    public const string LATE_DEDUCTION_RATE         = 'late_deduction_rate';

    /**
     * Default values for each configuration constant
     */
    private static array $defaultValues = [
        self::NUMBER_OF_PAID_LEAVE       => '2',
        self::PAID_LEAVE_CYCLE           => 'monthly',
        self::MAXIMUM_LATE_COUNT         => '3',
        self::KPI_PASSING_SCORE          => '60',
        self::KPI_EVALUATION_FREQUENCY   => 'monthly',
        self::KPI_WEIGHT_ATTENDANCE      => '50',
        self::KPI_WEIGHT_EVALUATION      => '50',
        self::PAYROLL_CURRENCY           => 'USD',
        self::PAYROLL_WORK_DAYS_PER_MONTH => '22',
        self::LATE_DEDUCTION_ENABLED     => '0',
        self::LATE_DEDUCTION_RATE        => '0.5',
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
