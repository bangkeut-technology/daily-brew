<?php
declare(strict_types=1);

namespace App\Constant;

use ReflectionClass;

/**
 * Class AbstractConstant
 *
 * @package App\Constant
 * @author  Vandeth THO <thovandeth@gmail.com>
 */
abstract class AbstractConstant
{
    /**
     * @return array
     */
    public static function getConstants(): array
    {
        $reflection = new ReflectionClass(static::class);

        return $reflection->getConstants();
    }

    /**
     * @return array
     */
    public static function getConstantNames(): array
    {
        $reflection = new ReflectionClass(static::class);

        return array_keys($reflection->getConstants());
    }

    /**
     * @return array
     *
     */
    public static function getConstantValues(): array
    {
        $reflection = new ReflectionClass(static::class);

        return array_values($reflection->getConstants());
    }
}