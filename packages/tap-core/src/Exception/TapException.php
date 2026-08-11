<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Exception;

/**
 * Every rejection this library can produce. Callers that just want "did the tap pass?" can catch
 * this one type; callers that want to tell the holder *why* (expired pass vs unknown credential)
 * match on the subclass.
 */
abstract class TapException extends \RuntimeException
{
}
