<?php

declare(strict_types=1);

namespace Bangkeut\Tap;

use Bangkeut\Tap\Assertion\AssertionKind;
use Bangkeut\Tap\Credential\Credential;

/**
 * A verified tap. Producing one of these is the library's entire job — what it *means* (a shift
 * started, an attendee admitted) belongs to the host application.
 */
final readonly class TapResult
{
    public function __construct(
        public AssertionKind $kind,
        /** Holder id for a device assertion, pass id for an issued pass. */
        public string $subjectId,
        public string $terminalId,
        public string $audienceId,
        /** When the tap happened: the device's signed clock, or the pass presentation time. */
        public \DateTimeImmutable $tappedAt,
        /** Which key matched — null for issued passes, which aren't tied to a device. */
        public ?Credential $credential = null,
        public bool $offlineBatch = false,
    ) {
    }
}
