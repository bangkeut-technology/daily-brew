<?php

declare(strict_types=1);

namespace Bangkeut\TapBundle\Event;

use Bangkeut\Tap\Exception\TapException;
use Bangkeut\Tap\TapRequest;

/**
 * A tap was refused. Worth listening to: a burst of InvalidSignature at one terminal is a cloned
 * credential, and a burst of NonceAlreadyUsed is either a replay attempt or a terminal that has
 * stopped rotating its nonces.
 */
final class TapRejectedEvent
{
    public function __construct(
        public readonly TapException $reason,
        public readonly TapRequest $request,
    ) {
    }
}
