<?php

declare(strict_types=1);

namespace App\Exception;

/**
 * A signed request failed verification. Deliberately carries one message for
 * every cause — unknown key, bad signature, stale timestamp, replayed nonce.
 *
 * A caller able to tell those apart has an oracle: "unknown key" vs "bad
 * signature" enumerates which key ids exist, and "replayed nonce" confirms a
 * captured request was otherwise valid. The real reason goes to the log, where
 * operators can see it and attackers can't.
 */
final class InvalidSignedRequestException extends \RuntimeException
{
    public const string PUBLIC_MESSAGE = 'Invalid request signature.';

    public function __construct(
        /** The operator-facing reason. Never returned to the client. */
        public readonly string $reason,
    ) {
        parent::__construct(self::PUBLIC_MESSAGE);
    }
}
