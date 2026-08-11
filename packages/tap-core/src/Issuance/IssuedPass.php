<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Issuance;

/**
 * A minted pass, in both the shapes a host needs: raw bytes for NFC, base64url for a barcode, a
 * wallet payload or a JSON body.
 *
 * A plain value object with no dependencies — it is meant to be stored, printed and handed around
 * the host application long after the issuer that produced it has gone out of scope.
 */
final readonly class IssuedPass
{
    public function __construct(
        public string $passId,
        public string $audienceId,
        public \DateTimeImmutable $notBefore,
        public \DateTimeImmutable $notAfter,
        /** The 98 wire bytes, exactly as a terminal will receive them. */
        public string $bytes,
        /** The same bytes, base64url with no padding — safe in a QR code, a URL or JSON. */
        public string $base64Url,
    ) {
    }

    /**
     * Whether the pass is inside its own validity window. Convenience for issuer-side UIs ("this
     * ticket has expired") — the door does not trust it, it re-derives everything from the bytes.
     */
    public function isValidAt(\DateTimeImmutable $moment): bool
    {
        $seconds = $moment->getTimestamp();

        return $seconds >= $this->notBefore->getTimestamp()
            && $seconds <= $this->notAfter->getTimestamp();
    }
}
