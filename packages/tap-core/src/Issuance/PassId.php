<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Issuance;

use Bangkeut\Tap\Exception\PassIssuanceFailed;
use Bangkeut\Tap\Tap;

/**
 * Pass and audience identifiers are fixed-width by design: the wire format has no length prefix for
 * them, so 12 bytes is 12 bytes and a 13-character id is a different protocol.
 */
final class PassId
{
    /**
     * No i, l, o, 0 or 1. A pass id ends up read aloud at a door and typed into a search box, and
     * "was that a one or an ell" is a support ticket.
     */
    public const string ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

    private function __construct()
    {
    }

    public static function generate(): string
    {
        $alphabet = self::ALPHABET;
        $max = strlen($alphabet) - 1;

        $id = '';
        for ($i = 0; $i < Tap::ID_LENGTH; $i++) {
            $id .= $alphabet[random_int(0, $max)];
        }

        return $id;
    }

    /**
     * Liberal in what the verifier accepts, strict in what an issuer emits: the decoder takes any
     * 12 bytes, but minting an id with a control character or a non-ASCII byte produces a pass that
     * survives the protocol and then breaks a barcode, a URL or a log line somewhere downstream.
     */
    public static function assertValid(string $id, string $field): void
    {
        if (strlen($id) !== Tap::ID_LENGTH) {
            throw new PassIssuanceFailed(sprintf(
                '%s must be exactly %d bytes, got %d.',
                $field,
                Tap::ID_LENGTH,
                strlen($id),
            ));
        }

        if (preg_match('/^[\x21-\x7E]{'.Tap::ID_LENGTH.'}$/', $id) !== 1) {
            throw new PassIssuanceFailed(sprintf(
                '%s must be printable ASCII with no spaces.',
                $field,
            ));
        }
    }
}
