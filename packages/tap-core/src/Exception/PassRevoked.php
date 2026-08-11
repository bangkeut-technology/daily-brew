<?php

declare(strict_types=1);

namespace Bangkeut\Tap\Exception;

/**
 * The pass is genuine, unexpired and for this event — and has been withdrawn since it was issued.
 *
 * Distinct from {@see InvalidSignature} on purpose: this holder is not an attacker, they are
 * someone whose ticket was refunded or replaced, and the door staff need to be told the difference.
 */
final class PassRevoked extends TapException
{
}
