<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Exception;

/** The pass was presented after its validity window closed. */
final class PassExpired extends TapException
{
}
