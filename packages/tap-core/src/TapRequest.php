<?php

declare(strict_types=1);

namespace Bangkeut\Tap;

/**
 * One presentation of a credential at one terminal.
 */
final readonly class TapRequest
{
    public function __construct(
        /** Raw assertion bytes — decode base64url before constructing. */
        public string $assertion,
        /** The random nonce this terminal generated for this tap. */
        public string $nonce,
        public string $terminalId,
        /** The event / tenant this terminal serves. Issued passes must name the same audience. */
        public string $audienceId,
        /**
         * True when this tap is being replayed from a terminal's offline queue: the freshness
         * window widens, everything else — signature, nonce, audience — is checked identically.
         */
        public bool $offlineBatch = false,
    ) {
    }
}
