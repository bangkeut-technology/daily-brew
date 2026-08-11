<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Exception;

/** Anti-passback: this pass was already admitted at this terminal moments ago. */
final class PassRecentlyUsed extends TapException
{
}
