<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Exception;

/** The pass was presented before its validity window opens. */
final class PassNotYetValid extends TapException
{
}
