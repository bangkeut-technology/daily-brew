<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Exception;

/** The pass was minted for a different event than this terminal serves. */
final class AudienceMismatch extends TapException
{
}
