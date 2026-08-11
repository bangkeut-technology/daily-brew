<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Assertion;

/**
 * A decoded, not-yet-verified assertion. Holding one of these means the bytes parsed —
 * nothing more. Only TapVerifier turns it into a trusted TapResult.
 */
interface Assertion
{
    public function kind(): AssertionKind;

    /** Who the assertion is about: a holder id (device) or a pass id (issued pass). */
    public function subjectId(): string;

    /** The raw 64-byte r ‖ s signature. */
    public function signature(): string;
}
