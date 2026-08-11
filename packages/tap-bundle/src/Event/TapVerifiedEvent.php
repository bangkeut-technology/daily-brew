<?php

declare(strict_types=1);

namespace Bangkeut\TapBundle\Event;

use Bangkeut\Tap\TapRequest;
use Bangkeut\Tap\TapResult;

/**
 * A tap passed verification. This is the seam every product plugs into: DailyBrew turns it into a
 * check-in, an event gate turns it into an admission. Listeners run inside the request, so a
 * listener that throws fails the tap — which is correct for "this holder is verified but not
 * allowed here", and wrong for anything merely cosmetic.
 */
final class TapVerifiedEvent
{
    public function __construct(
        public readonly TapResult $result,
        public readonly TapRequest $request,
    ) {
    }
}
